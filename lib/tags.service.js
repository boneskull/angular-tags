var KEYCODES = {
    enter: 13,
    esc: 27,
    backspace: 8,
    tab: 9,
    comma: 44
  },

  DEFAULTS = {
    addable: false,
    trim: true,
    delimiter: ',', // if given a string model, it splits on this
    classes: {}, // mapping of group names to classes,
    key_complete: [KEYCODES.enter, KEYCODES.comma],
    key_remove: [KEYCODES.backspace],
    key_blur: [KEYCODES.esc],
    template_path: 'tags.html',
    use_taglist: true
  },

  $tags = function $tags() {
    // TODO: support "track by"
    var SRC_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

    this.options = angular.copy(DEFAULTS);

    this.setOptions = function setOptions(opts) {
      angular.extend(this.options, opts);
    };

    this.$get = function $tags($parse) {
      /**
       * Parses the comprehension expression and gives us interesting bits.
       * @param {string} input
       * @returns {{itemName: string, source: function, sourceName: string, viewMapper: function, modelMapper: function}}
       */
      var parse = function parse(input) {
        var match;
        if (!input) {
          throw new Error('$tags.parse() expects a string parameter');
        }
        match = input.match(SRC_REGEXP);
        if (!match) {
          throw new Error(
            '$tags.parse() expected src specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
            ' but got "' + input + '"');
        }

        return {
          itemName: match[3],
          source: $parse(match[4]),
          sourceName: match[4],
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };

      };

      return {
        options: this.options,
        parse: parse
      };
    };
    this.$get.$inject = ['$parse'];
  };

tags.provider('$tags', $tags);
