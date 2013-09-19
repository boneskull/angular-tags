(function () {
  'use strict';
  try {
    angular.module('decipher.tags.templates');
  } catch (e) {
    angular.module('decipher.tags.templates', []);
  }
  var tags = angular.module('decipher.tags', [
      'ui.bootstrap.typeahead',
      'decipher.tags.templates'
    ]);
  var defaultOptions = {
      delimiter: ',',
      classes: {},
      templateUrl: 'tags.html',
      tagTemplateUrl: 'tag.html'
    }, SRC_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/, kc = {
      enter: 13,
      esc: 27,
      backspace: 8
    }, kcCompleteTag = [kc.enter], kcRemoveTag = [kc.backspace], kcCancelInput = [kc.esc], id = 0;
  tags.constant('decipherTagsOptions', {});
  tags.controller('TagsCtrl', [
    '$scope',
    '$timeout',
    function ($scope, $timeout) {
      var deletedSrcTags = [];
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
        var idx, _add = function _add(tag) {
            $scope.tags.push(tag);
            delete $scope.inputTag;
            $scope.$emit('decipher.tags.added', {
              tag: tag,
              $id: $scope.$id
            });
          }, fail = function fail() {
            $scope.$emit('decipher.tags.addfailed', {
              tag: tag,
              $id: $scope.$id
            });
          }, i;
        i = $scope.tags.length;
        while (i--) {
          if ($scope.tags[i].name === tag.name) {
            fail();
            return false;
          }
        }
        idx = $scope.srcTags.indexOf(tag);
        if (idx >= 0) {
          $timeout(function () {
            $scope.srcTags.splice(idx, 1);
          });
          deletedSrcTags.push(tag);
          _add(tag);
          return true;
        } else if ($scope.options.addable) {
          _add(tag);
          return true;
        }
        fail();
        return false;
      };
      $scope.selectArea = function selectArea() {
        $scope.toggles.inputActive = true;
      };
      $scope.remove = function remove(tag) {
        var idx;
        $scope.tags.splice($scope.tags.indexOf(tag), 1);
        if (idx = deletedSrcTags.indexOf(tag) >= 0) {
          deletedSrcTags.splice(idx, 1);
          $scope.srcTags.push(tag);
        }
        delete $scope.toggles.selectedTag;
        $scope.$emit('decipher.tags.removed', {
          tag: tag,
          $id: $scope.$id
        });
      };
    }
  ]);
  tags.directive('decipherTagsInput', [
    '$timeout',
    '$filter',
    '$rootScope',
    function ($timeout, $filter, $rootScope) {
      return {
        restrict: 'C',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
          var delimiterRx = new RegExp('^' + scope.options.delimiter + '+$'), cancel = function cancel() {
              ngModel.$setViewValue('');
              ngModel.$render();
            }, addTag = function addTag(value) {
              if (value) {
                if (value.match(delimiterRx)) {
                  cancel();
                  return;
                }
                if (scope.add({ name: value })) {
                  cancel();
                }
              }
            }, addTags = function (tags) {
              var i;
              for (i = 0; i < tags.length; i++) {
                addTag(tags[i]);
              }
            }, removeLastTag = function removeLastTag() {
              var orderedTags;
              if (scope.toggles.selectedTag) {
                scope.remove(scope.toggles.selectedTag);
                delete scope.toggles.selectedTag;
              } else if (!ngModel.$viewValue) {
                orderedTags = $filter('orderBy')(scope.tags, scope.orderBy);
                scope.toggles.selectedTag = orderedTags[orderedTags.length - 1];
              }
            };
          element.bind('focus', function () {
            if ($rootScope.$$phase) {
              delete scope.toggles.selectedTag;
            } else {
              scope.$apply(function () {
                delete scope.toggles.selectedTag;
              });
            }
          });
          element.bind('keypress', function (evt) {
            scope.$apply(function () {
              if (scope.options.delimiter.charCodeAt() === evt.which) {
                addTag(ngModel.$viewValue);
              }
            });
          });
          element.bind('keypress', function (evt) {
            scope.$apply(function () {
              if (kcCompleteTag.indexOf(evt.which) >= 0) {
                addTag(ngModel.$viewValue);
              } else if (kcCancelInput.indexOf(evt.which) >= 0) {
                cancel();
                scope.toggles.inputActive = false;
              } else if (kcRemoveTag.indexOf(evt.which) >= 0) {
                removeLastTag();
              } else {
                delete scope.toggles.selectedTag;
                scope.$emit('decipher.tags.keyup', {
                  value: ngModel.$viewValue,
                  $id: scope.$id
                });
              }
            });
          });
          scope.$watch('toggles.inputActive', function (newVal) {
            if (newVal) {
              $timeout(function () {
                element[0].focus();
              });
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
            if (tag && tag.value) {
              element.val('');
              return;
            }
            return tag;
          });
        }
      };
    }
  ]);
  tags.directive('tags', [
    '$document',
    '$timeout',
    '$parse',
    'decipherTagsOptions',
    function ($document, $timeout, $parse, decipherTagsOptions) {
      return {
        controller: 'TagsCtrl',
        restrict: 'E',
        template: '<ng-include data-src="options.templateUrl"></ng-include>',
        scope: { model: '=' },
        link: function (scope, element, attrs) {
          var srcResult, source, group, value, i, o, locals, obj, model, pureStrings = false, stringArray = false, defaults = angular.copy(defaultOptions), userDefaults = angular.copy(decipherTagsOptions), parse = function parse(input) {
              var match = input.match(SRC_REGEXP);
              if (!match) {
                throw new Error('Expected src specification in form of \'_modelValue_ (as _label_)? for _item_ in _collection_\'' + ' but got \'' + input + '\'.');
              }
              return {
                itemName: match[3],
                source: $parse(match[4]),
                viewMapper: $parse(match[2] || match[1]),
                modelMapper: $parse(match[1])
              };
            }, format = function format(value) {
              var arr = [], sanitize = function sanitize(tag) {
                  return tag.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
                };
              if (angular.isUndefined(value)) {
                return;
              }
              if (angular.isString(value)) {
                arr = value.split(scope.options.delimiter).map(function (item) {
                  return { name: sanitize(item.trim()) };
                });
              } else if (angular.isArray(value)) {
                arr = value.map(function (item) {
                  if (angular.isString(item)) {
                    return { name: sanitize(item.trim()) };
                  } else if (item.name) {
                    item.name = sanitize(item.name.trim());
                  }
                  return item;
                });
              } else if (angular.isDefined(value)) {
                throw 'list of tags must be an array or delimited string';
              }
              return arr;
            };
          scope.options = angular.extend(defaults, angular.extend(userDefaults, scope.$eval(attrs.options)));
          scope.orderBy = scope.options.orderBy;
          scope.toggles = { inputActive: false };
          scope.$watch('tags', function (value, oldValue) {
            if (value !== oldValue) {
              if (stringArray || pureStrings) {
                value = value.map(function (tag) {
                  return tag.name;
                });
                if (pureStrings) {
                  value = value.join(scope.options.delimiter);
                }
              }
              scope.model = value;
            }
          }, true);
          scope.$on('decipher.tags.sort', function (evt, data) {
            scope.orderBy = data;
          });
          model = scope.model;
          if (angular.isString(model)) {
            pureStrings = true;
          } else if (angular.isArray(model)) {
            stringArray = true;
            i = model.length;
            while (i--) {
              if (!angular.isString(model[i])) {
                stringArray = false;
                break;
              }
            }
          }
          scope.tags = format(scope.model);
          scope.srcTags = [];
          if (attrs.src) {
            scope.options.addable = scope.options.addable || false;
            srcResult = parse(attrs.src);
            source = srcResult.source(scope.$parent);
            locals = {};
            if (angular.isDefined(source)) {
              for (i = 0; i < source.length; i++) {
                locals[srcResult.itemName] = source[i];
                obj = {};
                obj.value = srcResult.modelMapper(scope.$parent, locals);
                if (obj.value.group || obj.value.value) {
                  group = obj.value.group;
                  value = obj.value.value;
                } else {
                  value = obj.value;
                }
                o = {};
                if (angular.isObject(obj.value)) {
                  o = angular.extend(obj.value, {
                    name: srcResult.viewMapper(scope.$parent, locals),
                    value: value,
                    group: group
                  });
                } else {
                  o = {
                    name: srcResult.viewMapper(scope.$parent, locals),
                    value: value,
                    group: group
                  };
                }
                scope.srcTags.push(o);
              }
            }
          } else {
            scope.options.addable = true;
          }
          scope.$id = ++id;
          scope.$emit('decipher.tags.initialized', {
            $id: scope.$id,
            model: scope.model
          });
        }
      };
    }
  ]);
}());