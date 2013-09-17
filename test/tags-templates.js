angular.module('templates-main', ['tags.html']);

angular.module("tags.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tags.html",
    "<div class=\"decipher-tags\" data-ng-mousedown=\"areaSelected()\">\n" +
    "\n" +
    "  <div class=\"decipher-tags-taglist\">\n" +
    "    <span data-ng-repeat=\"tag in tags\"\n" +
    "          data-ng-mousedown=\"$event.stopPropagation()\">\n" +
    "\n" +
    "      <span class=\"decipher-tags-tag\" ng-class=\"getGroupClass(tag)\">{{tag.name}}\n" +
    "      <i class=\"icon-remove\"\n" +
    "         data-ng-click=\"remove(tag)\">\n" +
    "      </i>\n" +
    "      </span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"container decipher-tags-input-wrapper\" data-ng-show=\"inputActive\">\n" +
    "    <input ng-if=\"!srcTags\" type=\"text\" data-ng-model=\"inpTag\"\n" +
    "           class=\"decipher-tags-input\"\n" +
    "           data-ng-blur=\"inputBlurred()\"\n" +
    "           data-tags-focus-when-active\n" +
    "           data-ng-keydown=\"keypress($event)\"/>\n" +
    "    <input ng-if=\"srcTags\" type=\"text\" data-ng-model=\"inpTag\"\n" +
    "           class=\"decipher-tags-input\"\n" +
    "           typeahead=\"stag as stag.name for stag in srcTags | filter:$viewValue | limitTo:limitTo\"\n" +
    "           data-tags-focus-when-active\n" +
    "           data-typeahead-on-select=\"tagSelected()\"\n" +
    "           data-typeahead-editable=\"allowsEditable\"\n" +
    "           data-ng-blur=\"inputBlurred()\"\n" +
    "           data-ng-keydown=\"keypress($event)\"/>\n" +
    "\n" +
    "  </div>\n" +
    "  <!--data-typeahead=\"\"-->\n" +
    "  <!--data-typeahead-on-select=\"tagSelected()\"-->\n" +
    "  <!--data-typeahead-editable=\"allowsEditable\"-->\n" +
    "  <!--<div ng-show=\"hasControls\" class=\"controls\">-->\n" +
    "  <!--<div class=\"pull-right\">-->\n" +
    "  <!--<button type=\"button\" class=\"btn btn-sm\" data-stop-event=\"mousedown\"-->\n" +
    "  <!--ng-click=\"cancelClicked()\">Cancel</button>-->\n" +
    "  <!--<button type=\"button\" class=\"btn btn-primary btn-sm\" data-stop-event=\"mousedown\"-->\n" +
    "  <!--ng-click=\"okClicked()\">OK</button>-->\n" +
    "  <!--</div>-->\n" +
    "  <!--</div>-->\n" +
    "\n" +
    "</div>\n" +
    "");
}]);
