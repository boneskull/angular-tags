/*global angular*/
(function () {
  'use strict';

  var tags = angular.module('decipher.tags', ['ui.bootstrap.typeahead']);

  tags.directive('tags', function ($document, $timeout, $parse) {

    var options = {
        delimiter: ',',
        classes: {}
      },
      SRC_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

    return {

      controller: function ($scope, $element, $attrs) {

        var kc = {
          comma: 188,
          space: 32,
          enter: 13,
          esc: 27
        };

        var keyCodes_CompleteTag = [kc.comma, kc.enter];
        var keyCodes_CancelInput = [kc.esc];

        initTagsControl();

        //////////////////////

        // returns object used by tag's ng-class
        $scope.getGroupClass = function getGroupClass(otag) {
          var r = {};

          angular.forEach(options.classes, function (klass, groupName) {
            if (otag.group === groupName) {
              r[klass] = true;
            }
          });
          return r;
        };

        // handle keypresses, i.e. force entry of current on comma, space...
        $scope.keypress = function ($event) {

          // no action unless entering input
          if (!$scope.inputActive) return;

          // check for special keys (i.e. comma, space)
          if (keyCodes_CompleteTag.indexOf($event.keyCode) !== -1) {
            //console.log('todo key: complete tag', $scope.inpTag);
          }

          if (keyCodes_CancelInput.indexOf($event.keyCode) !== -1) {
            $scope.inputActive = false;
          }
        };

        // called from typeahead when tag entered
        $scope.tagSelected = function () {

          var otag = filterTag($scope.inpTag);

          // add the tag
          $scope.wtags.push(otag);

          // remove, so can't add twice
          var foundit;
          var arr = $scope.srcTags;
          for (var i = 0; i < arr.length; i++) {
            var itag = arr[i];
            if (itag === otag) {
              arr.splice(i, 1);
              foundit = true;
              break;
            }
          }
          if (!foundit) throw 'tags error';

          // clear the input
          delete $scope.inpTag;

          // keep the input open
          $scope.inputActive = true;

          event_tagAdded(otag);
        };

        // activate typeahead if clicked
        // if already active - keep the focus on the input
        $scope.areaSelected = function () {
          if ($scope.inputActive) {
            $scope.ignoreBlur = true;
          } else {
            $scope.inputActive = true;
          }
        };

        // ng-click handler to remove tag
        $scope.remove = function (tag) {
          $scope.ignoreBlur = false;

          // remove tag
          $scope.tags.splice($scope.tags.indexOf(tag), 1);

          // add it back into availables
          $scope.srcTags.push(tag);

          // ensure tag back in right spot
          $scope.srcTags.sort(tagSortCompareFn);

          $scope.$emit('decipher.tags.removed', {
            tag: tag
          });
        };

        $scope.cancelClicked = function () {
          cancelTagEdit();
          if ($scope.cb_cancel) $scope.cb_cancel();
        };

        $scope.okClicked = function () {
          if ($scope.cb_ok) $scope.cb_ok($scope.tags);
        };

        // TODO - change all this to use template compile & append ************

        // keep the focus on the input even if it was blurred?
        // else hide input on blur

        $scope.inputBlurred = function () {
          if ($scope.ignoreBlur) {
            //console.log('ignored blur and refocused');
            $scope.ignoreBlur = false;

            $timeout(function () {
              // restore focus
              var inputelem = $element.find('input');
              inputelem[0].focus();

              // show input
              $scope.inputActive = true;
            });
          } else {
            // hide input
            //console.log('blur input closed');
            $scope.inputActive = false;
            delete $scope.inpTag;
          }

        };
        //////////////////////

        function getOTags(tags) {
          var r;
          if (tags === undefined) tags = [];

          if ($scope.tagsAreStrings) {
            // turn strings into otag objects
            r = [];
            angular.forEach($scope.tags, function (s) {
              r.push({ tag: s});
            });
          } else {
            r = angular.copy($scope.tags || []);
          }

          return r;
        }

        // resets back to initial state
        function cancelTagEdit() {
          $scope.tags = angular.copy($scope.initialTags);
          $scope.wtags = angular.copy($scope.initialWTags);
          $scope.srcTags = angular.copy($scope.initialsrc);
          $scope.inputActive = false;
        }

        // sort tags alphabetically
        function tagSortCompareFn(a, b) {
          if (a.tag < b.tag) return -1;
          if (a.tag > b.tag) return 1;
          return 0;
        }

        // todo: use an angular filter
        // todo: get regex from existing tag library
        function filterTag(otag) {

          if (otag.tag) {
            otag.tag = otag.tag
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/'/g, '&#39;')
              .replace(/"/g, '&quot;');
          }

          return otag;
        }

        function removeTagFromResults(otag) {
          var v = getTagFromOTag(otag);
          var idx;
          angular.forEach($scope.tags, function (t, i) {
            if (angular.equals(v, t)) idx = i;
          });
          if (idx === undefined) throw "tag remove error";
          $scope.tags.splice(idx, 1);
        }

        function event_tagAdded(otag) {
          addTagToResults(otag);
          if ($scope.cb_TagAdded) {
            $scope.cb_TagAdded(getTagFromOTag(otag));
          }
        }

        function event_tagRemoved(otag) {
          removeTagFromResults(otag);
          if ($scope.cb_TagRemoved) {
            $scope.cb_TagRemoved(getTagFromOTag(otag));
          }
        }

        //////////////////////

        function initTagsControl() {
          return;
          // if tag-groups attribute exists - tags are objects not strings
          $scope.tagsAreStrings = !$scope.tagCssMap;

          // show controls?
          $scope.hasControls = angular.isDefined($scope.cb_cancel) ||
                               angular.isDefined($scope.cb_ok);

          // config of typeahead
          $scope.limitTo = 5;             // how many shown in dropdown
          $scope.allowsEditable = true;   // todo - probably wont need to use this

          // TODO - will change when use template compile append
          $scope.inputActive = false;
          $scope.inputExists = true;

          // the input string used by typeahead autocomplete
          $scope.inpTag = '';

          // src used by typeahead
          $scope.srcTags = [];
          function addSrcArray(tagArray, group) {
            angular.forEach(tagArray, function (label) {

              $scope.srcTags.push({
                tag: label,
                group: group
              });

            });
          }

          // source tags can be either string array
          // or map of string arrays

          var tagsrc = $scope.tagsrc() || [];
          if (angular.isArray(tagsrc)) {
            addSrcArray(tagsrc);
          } else {
            for (var k in tagsrc) {
              addSrcArray(tagsrc[k], k);
            }
          }

          $scope.srcTags.sort(tagSortCompareFn);
          $scope.initialsrc = angular.copy($scope.srcTags);

          // working tags, remember initial state

          $scope.wtags = getOTags($scope.tags);
          $scope.initialWTags = angular.copy($scope.wtags);
          $scope.initialTags = angular.copy($scope.tags);

        }

      },
      restrict: 'E',
      template: '<ng-include data-src="templateUrl"></ng-include>',
      require: 'ngModel',
      scope: {
        model: '=ngModel',
        src: '@'
      },
      link: function (scope, element, attrs, ngModel) {
        var srcResult,
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

        angular.extend(options,
          scope.$eval(attrs.options));
        scope.templateUrl =
        attrs.templateUrl ? scope.$eval(attrs.templateUrl) : 'tags.html';

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
          var arr = [];
          if (angular.isString(value)) {
            arr = value
              .split(options.delimiter)
              .map(function (item) {
                return {
                  name: item.trim()
                };
              });
          }
          else if (angular.isArray(value)) {
            arr = value.map(function (item) {
              if (angular.isString(item)) {
                return {
                  name: item
                };
              }
              return item;
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
          for (var i = 0; i < source.length; i++) {
            locals[srcResult.itemName] = source[i];
            scope.srcTags.push({
              name: srcResult.viewMapper(scope.$parent, locals),
              value: srcResult.modelMapper(scope.$parent, locals)
            });
          }
        }

        scope.initialTags = angular.copy(scope.model);
        scope.initialSrc = angular.copy(scope.srcTags);

      }
    };
  });

  tags.directive('tagsFocusWhenActive', function ($timeout) {
    return function (scope, element) {
      scope.$watch('inputActive', function (newValue) {
        if (newValue) {
          $timeout(function () {
            element[0].focus();
          });
        } else {


          // TODO *********** - won't need to do this with template compile

          // note: looks inside typeaheads internal html
          // doing this because couldn't find other way to cancel
          // a live typeahead dropdown-menu when ng-show hiding it
          // i.e. typeahead doesn't provide an api for that

          var dm = element[0].parentNode.querySelector('.dropdown-menu');
          if (dm) {
            // get the angular scope of typeaheads dropdown
            var ss = (angular.element(dm)).scope();
            // reach in and clear the matches
            ss.matches = [];
          }
        }
      });
    };
  });


})();
