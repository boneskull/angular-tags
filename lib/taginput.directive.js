'use strict';

var tagInputDirective = function ($timeout, $filter, $rootScope) {
  return {
    restrict: 'A',
    require: ['ngModel', '^tags'],
    link: function (scope, element, attrs, ctrls) {

      var ngModel = ctrls[0],
        tags = ctrls[1],
        opts = tags.opts,
        delimiter = opts.delimiter,
        trim = opts.trim,
        delimiterRx = new RegExp('^' + delimiter + '+$'),

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
            if (delimiterRx.test(value)) {
              return cancel();
            }
            if (scope.add({
                name: value
              })) {
              cancel();
            }
          }
        },

        /**
         * Adds multiple tags in case you pasted them.
         * @param tags
         */
        addTags = function (tags) {
          var i;
          for (i = 0; i < tags.length;
            i++) {
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
            orderedTags =
              $filter('orderBy')(scope.tags,
                scope.orderBy);
            scope.toggles.selectedTag =
              orderedTags[orderedTags.length - 1];
          }
        };

      /**
       * When we focus the text input area, drop the selected tag
       */
      element.bind('focus', function () {
        scope.$digest();
        delete scope.toggles.selectedTag;
        return;

        // this avoids what looks like a bug in typeahead.  It seems
        // to be calling element[0].focus() somewhere within a digest loop.
        //if ($rootScope.$$phase) {
        //  delete scope.toggles.selectedTag;
        //} else {
        //  scope.$apply(function () {
        //    delete scope.toggles.selectedTag;
        //  });
        //}
      });

      /**
       * Detects the delimiter.
       */
      element.bind('keypress',
        function (evt) {
          if (delimiter.charCodeAt(0) === evt.which) {
            addTag(ngModel.$viewValue);
          }
        });

      /**
       * Inspects whatever you typed to see if there were character(s) of
       * concern.
       */
      element.bind('keydown',
        function (evt) {
          scope.$apply(function () {
            // to "complete" a tag

            if (KC_COMPLETE_TAG.indexOf(evt.which) >=
              0) {
              addTag(ngModel.$viewValue);

              // or if you want to get out of the text area
            } else if (KC_CANCEL_INPUT.indexOf(evt.which) >=
              0 && !evt.isPropagationStopped()) {
              cancel();
              scope.toggles.inputActive =
                false;

              // or if you're trying to delete something
            } else if (KC_REMOVE_TAG.indexOf(evt.which) >=
              0) {
              removeLastTag();

              // otherwise if we're typing in here, just drop the selected tag.
            } else {
              delete scope.toggles.selectedTag;
              scope.$emit('badwing.tags.keyup',
                {
                  value: ngModel.$viewValue,
                  $id: scope.$id
                });
            }
          });
        });

      /**
       * When inputActive toggle changes to true, focus the input.
       * And no I have no idea why this has to be in a timeout.
       */
      scope.$watch('toggles.inputActive',
        function (newVal) {
          if (newVal) {
            $timeout(function () {
              element[0].focus();
            });
          }
        });

      /**
       * Detects a paste
       */
      ngModel.$parsers.unshift(function (value) {
        var values = value.split(delimiter);
        if (trim) {
          values = values.map(function (value) {
            return value.trim();
          });
        }
        if (values.length > 1) {
          addTags(values);
        }
        //if (delimiterRx.test(value)) {
        //  element.val('');
        //  return;
        //}
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
      });
    }
  };
};
tagInputDirective.$inject = ['$timeout', '$filter', '$rootScope', 'badwing.tags.options'];

module.exports = tagInputDirective;
