/*global angular*/
(function () {
  'use strict';

  var tags = angular.module('decipher.tags', ['ui.bootstrap.typeahead']);

  var defaultOptions = {
      delimiter: ',',
      classes: {},
      orderBy: 'name'
    },
    SRC_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/,
    kc = {
      comma: 188,
      enter: 13,
      esc: 27,
      backspace: 8
    },
    kcCompleteTag = [kc.comma, kc.enter],
    kcRemoveTag = [kc.backspace],
    kcCancelInput = [kc.esc];

  tags.controller('TagsCtrl', function ($scope) {

    //////////////////////
    var deletedSrcTags = [];

    // returns object used by tag's ng-class
    $scope.getClasses = function getGroupClass(tag) {
      var r = {};

      if (tag === $scope.toggles.selectedTag) {
        r.selected = true;
      }

      angular.forEach($scope.options.classes, function (klass, groupName) {
        if (tag.group === groupName) {
          r[klass] = true;
        }
      });
      return r;
    };

    $scope.add = function add(tag) {
      var idx;

      $scope.tags.push(tag);
      delete $scope.inputTag;

      idx = $scope.srcTags.indexOf(tag);
      if (idx >= 0) {
        $scope.srcTags.splice(idx, 1);
        deletedSrcTags.push(tag);
      }

      $scope.$emit('decipher.tags.added', {
        tag: tag
      });
    };

    // activate typeahead if clicked
    // if already active - keep the focus on the input
    $scope.selectArea = function selectArea() {
      $scope.toggles.inputActive = true;
    };

    $scope.selectTag = function selectTag(tag) {
      $scope.toggles.selectedTag = tag;

      $scope.$emit('decipher.tags.selected', {
        tag: tag
      });
    };

    // ng-click handler to remove tag
    $scope.remove = function removeTag(tag) {
      var idx;
      $scope.tags.splice($scope.tags.indexOf(tag), 1);

      if (idx = deletedSrcTags.indexOf(tag) >= 0) {
        deletedSrcTags.splice(idx, 1);
        $scope.srcTags.push(tag);
      }

      delete $scope.toggles.selectedTag;

      $scope.$emit('decipher.tags.removed', {
        tag: tag
      });
    };

  });

  tags.directive('decipherTagsInput', function ($timeout, $filter, $rootScope) {
    return {
      restrict: 'C',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        var delimiterRx = new RegExp('^' + scope.options.delimiter +
                                     '+$'),
          cancel = function cancel() {
            ngModel.$setViewValue('');
            ngModel.$render();
          },
          addTag = function addTag(value) {
            if (value) {
              if (value.match(delimiterRx)) {
                cancel();
                return;
              }
              scope.add({
                name: value
              });
              cancel();
            }
          },
          addTags = function (tags) {
            var i;
            for (i = 0; i < tags.length; i++) {
              addTag(tags[i]);
            }
          },
          removeLastTag = function removeLastTag() {
            // only do this if the input field is empty.
            var orderedTags;
            if (scope.toggles.selectedTag) {
              scope.remove(scope.toggles.selectedTag);
              delete scope.toggles.selectedTag;
            }
            else if (!ngModel.$viewValue) {
              orderedTags = $filter('orderBy')(scope.tags, scope.orderBy);
              scope.toggles.selectedTag = orderedTags[orderedTags.length - 1];
            }
          };

        element.bind('focus', function () {
          // this avoids what looks like a bug in typeahead.
          if ($rootScope.$$phase) {
            delete scope.toggles.selectedTag;
          } else {
            scope.$apply(function () {
              delete scope.toggles.selectedTag;
            });
          }

        });

        element.bind('keyup', function (evt) {
          scope.$apply(function () {
            if (kcCompleteTag.indexOf(evt.keyCode) >= 0) {
              addTag(ngModel.$viewValue);
            } else if (kcCancelInput.indexOf(evt.keyCode) >= 0) {
              cancel();
              scope.toggles.inputActive = false;
            } else if (kcRemoveTag.indexOf(evt.keyCode) >= 0) {
              removeLastTag();
            } else {
              delete scope.toggles.selectedTag;
            }
          });
        });

        scope.$watch('toggles.inputActive', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            if (newVal) {
              $timeout(function () {
                element[0].focus();
              });
            }
          }
        });

        ngModel.$parsers.unshift(function (value) {
          var values = value.split(scope.options.delimiter);
          if (values.length > 1) {
            addTags(values);
          }
          if (value.match(delimiterRx)) {
            element.val('');
            return;
          }
          return value;
        });

        ngModel.$formatters.push(function (tag) {
          // resets the input if coming from the source tags
          if (tag && tag.value) {
            element.val('');
            return;
          }
          return tag;
        })
      }
    };
  });

  tags.directive('tags', function ($document, $timeout, $parse) {

    return {
      controller: 'TagsCtrl',
      restrict: 'E',
      template: '<ng-include data-src="templateUrl"></ng-include>',
      require: 'ngModel',
      scope: {
        model: '=ngModel',
        src: '@'
      },
      link: function (scope, element, attrs, ngModel) {
        var srcResult,
          defaults = angular.copy(defaultOptions),
          parse = function parse(input) {
            var match = input.match(SRC_REGEXP);
            if (!match) {
              throw new Error(
                "Expected src specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_'" +
                " but got '" + input + "'.");
            }

            return {
              itemName: match[3],
              source: $parse(match[4]),
              viewMapper: $parse(match[2] || match[1]),
              modelMapper: $parse(match[1])
            };

          };

        scope.options = angular.extend(defaults,
          scope.$eval(attrs.options));
        scope.orderBy = scope.options.orderBy;

        scope.templateUrl = scope.options.templateUrl || 'tags.html';
        scope.toggles = {
          inputActive: false
        };

        // the following two watches are workarounds for this issue:
        // https://github.com/angular/angular.js/issues/1924
        // Bring in changes from outside:
        scope.$watch('model', function () {
          scope.$eval(attrs.ngModel + ' = model');
        });

        // Send out changes from inside:
        scope.$watch(attrs.ngModel, function (val) {
          scope.model = val;
        });

        // if we have a string for the model, turn it into an array of objects.
        // if we have an array of strings, or an array with strings in it,
        // turn that into an array of objects.
        ngModel.$formatters.push(function (value) {
          var arr = [],
            sanitize = function sanitize(tag) {
              return tag
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&#39;')
                .replace(/"/g, '&quot;');
            };
          if (angular.isString(value)) {
            arr = value
              .split(scope.options.delimiter)
              .map(function (item) {
                return {
                  name: sanitize(item.trim())
                };
              });
          }
          else if (angular.isArray(value)) {
            arr = value.map(function (item) {
              if (angular.isString(item)) {
                return {
                  name: sanitize(item.trim())
                };
              }
              return sanitize(item);
            })
          }
          else if (angular.isDefined(value)) {
            throw 'list of tags must be an array or delimited string';
          }
          return arr;
        });

        ngModel.$render = function $render() {
          scope.tags = ngModel.$viewValue;
        };

        scope.srcTags = [];
        if (scope.src) {
          srcResult = parse(scope.src);
          var source = srcResult.source(scope.$parent), locals = {};
          if (angular.isDefined(source)) {
            for (var i = 0; i < source.length; i++) {
              locals[srcResult.itemName] = source[i];
              scope.srcTags.push({
                name: srcResult.viewMapper(scope.$parent, locals),
                value: srcResult.modelMapper(scope.$parent, locals)
              });
            }
          }
        }
      }
    };
  });

})();
