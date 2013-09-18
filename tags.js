/*global angular*/
(function () {
  'use strict';

  var tags = angular.module('decipher.tags', ['ui.bootstrap.typeahead']);

  var defaultOptions = {
      delimiter: ',', // if given a string model, it splits on this
      classes: {}, // obj of group names to classes
      orderBy: 'name' // what we order the tags and typeahead by
    },

    // for parsing comprehension expression
    SRC_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/,

    // keycodes
    kc = {
      comma: 188,
      enter: 13,
      esc: 27,
      backspace: 8
    },
    kcCompleteTag = [kc.comma, kc.enter],
    kcRemoveTag = [kc.backspace],
    kcCancelInput = [kc.esc];

  /**
   * TODO: do we actually share functionality here?  We're using this
   * controller on both the subdirective and its parent, but I'm not sure
   * if we actually use the same functions in both.
   */
  tags.controller('TagsCtrl', function ($scope) {

    var deletedSrcTags = [];

    /**
     * Figures out what classes to put on the tag span.  It'll add classes
     * if defined by group, and it'll add a selected class if the tag
     * is preselected to delete.
     * @param tag
     * @returns {{}}
     */
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

    /**
     * Adds a tag to the list of tags, and if in the typeahead list,
     * removes it from that list (and saves it).  emits decipher.tags.added
     * @param tag
     */
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

    /**
     * Toggle the input box active.
     */
    $scope.selectArea = function selectArea() {
      $scope.toggles.inputActive = true;
    };

    /**
     * Select a tag and emit an event.
     * @param tag
     */
    $scope.select = function select(tag) {
      $scope.toggles.selectedTag = tag;

      $scope.$emit('decipher.tags.selected', {
        tag: tag
      });
    };

    /**
     * Removes a tag.  Restores stuff into srcTags if it came from there.
     * Kills any selected tag.  Emit a decipher.tags.removed event.
     * @param tag
     */
    $scope.remove = function remove(tag) {
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

  /**
   * Directive for the 'input' tag itself, which is of class
   * decipher-tags-input.
   */
  tags.directive('decipherTagsInput', function ($timeout, $filter, $rootScope) {
    return {
      restrict: 'C',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        var delimiterRx = new RegExp('^' + scope.options.delimiter +
                                     '+$'),

          /**
           * Cancels the text input box.
           */
          cancel = function cancel() {
            ngModel.$setViewValue('');
            ngModel.$render();
          },

          /**
           * Adds a tag you typed/pasted in unless it's a bunch of delimiters.
           * @param value
           */
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

          /**
           * Adds multiple tags in case you pasted them.
           * @param tags
           */
          addTags = function (tags) {
            var i;
            for (i = 0; i < tags.length; i++) {
              addTag(tags[i]);
            }
          },

          /**
           * Backspace one to select, and a second time to delete.
           */
          removeLastTag = function removeLastTag() {
            var orderedTags;
            if (scope.toggles.selectedTag) {
              scope.remove(scope.toggles.selectedTag);
              delete scope.toggles.selectedTag;
            }
            // only do this if the input field is empty.
            else if (!ngModel.$viewValue) {
              orderedTags = $filter('orderBy')(scope.tags, scope.orderBy);
              scope.toggles.selectedTag = orderedTags[orderedTags.length - 1];
            }
          };

        /**
         * When we focus the text input area, drop the selected tag
         */
        element.bind('focus', function () {
          // this avoids what looks like a bug in typeahead.  It seems
          // to be calling element[0].focus() somewhere within a digest loop.
          if ($rootScope.$$phase) {
            delete scope.toggles.selectedTag;
          } else {
            scope.$apply(function () {
              delete scope.toggles.selectedTag;
            });
          }
        });

        /**
         * Inspects whatever you typed to see if there were character(s) of
         * concern.
         */
        element.bind('keyup', function (evt) {
          scope.$apply(function () {
            // to "complete" a tag
            if (kcCompleteTag.indexOf(evt.keyCode) >= 0) {
              addTag(ngModel.$viewValue);

            // or if you want to get out of the text area
            } else if (kcCancelInput.indexOf(evt.keyCode) >= 0) {
              cancel();
              scope.toggles.inputActive = false;

            // or if you're trying to delete something
            } else if (kcRemoveTag.indexOf(evt.keyCode) >= 0) {
              removeLastTag();

            // otherwise if we're typing in here, just drop the selected tag.
            } else {
              delete scope.toggles.selectedTag;
            }
          });
        });

        /**
         * When inputActive toggle changes to true, focus the input.
         * And no I have no idea why this has to be in a timeout.
         */
        scope.$watch('toggles.inputActive', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            if (newVal) {
              $timeout(function () {
                element[0].focus();
              });
            }
          }
        });

        /**
         * Detects a paste or someone jamming on the delimiter key.
         */
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

        /**
         * Resets the input field if we selected something from typeahead.
         */
        ngModel.$formatters.push(function (tag) {
          if (tag && tag.value) {
            element.val('');
            return;
          }
          return tag;
        })
      }
    };
  });

  /**
   * Main directive
   */
  tags.directive('tags', function ($document, $timeout, $parse) {

    return {
      controller: 'TagsCtrl',
      restrict: 'E',
      template: '<ng-include data-src="templateUrl"></ng-include>',
      require: 'ngModel',
      // we cannot use an isolate scope here due to this issue:
      // https://github.com/angular/angular.js/issues/1924
      // either that or I'm too stupid to figure it out
      scope: true,
      link: function (scope, element, attrs, ngModel) {
        var srcResult,
          source,
          locals,
          defaults = angular.copy(defaultOptions),

          /**
           * Parses the comprehension expression and gives us interesting bits.
           * @param input
           * @returns {{itemName: *, source: *, viewMapper: *, modelMapper: *}}
           */
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

        // merge options
        scope.options = angular.extend(defaults,
          scope.$eval(attrs.options));
        // break out orderBy for view
        scope.orderBy = scope.options.orderBy;

        // if we've specified an alternative template, use it.
        scope.templateUrl = scope.options.templateUrl || 'tags.html';

        // this should be named something else since it's just a collection
        // of random shit.
        scope.toggles = {
          inputActive: false
        };

        /**
         * if we have a string for the model, turn it into an array of objects.
         * if we have an array of strings, or an array with strings in it,
         * turn that into an array of objects.
         */
        ngModel.$formatters.push(function (value) {
          var arr = [],
            /**
             * TODO: replace with something from ngSanitize or $sce
             * or something.
             * @param tag
             * @returns {XML|string}
             */
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
              return angular.extend(item, {name: sanitize(item.name)});
            })
          }
          else if (angular.isDefined(value)) {
            throw 'list of tags must be an array or delimited string';
          }
          return arr;
        });

        /**
         * This doesn't actually render per se, but what it does is two things:
         * 1. propagates the (new) value of scope.tags to the parent.  If
         * you happened to have given it a list of strings, you'll get a list
         * of objects back instead.
         * 2. sets scope.tags to be used in the template.
         */
        ngModel.$render = function $render() {
          var getter = $parse(attrs.ngModel);
          getter.assign(scope.$parent, ngModel.$viewValue);
          scope.tags = ngModel.$viewValue;
        };

        // this stuff takes the parsed comprehension expression and
        // makes a srcTags array full of tag objects out of it.
        scope.srcTags = [];
        if (attrs.src) {
          srcResult = parse(attrs.src);
          source = srcResult.source(scope.$parent);
          locals = {};
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
