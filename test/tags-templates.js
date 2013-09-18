angular.module('templates-main', ['tags.html', 'tag.html']);

angular.module("tags.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tags.html",
    "<div class=\"decipher-tags\" data-ng-mousedown=\"selectArea()\">\n" +
    "\n" +
    "  <div class=\"decipher-tags-taglist\">\n" +
    "    <span data-ng-repeat=\"tag in tags|orderBy:orderBy\"\n" +
    "          data-ng-mousedown=\"$event.stopPropagation()\">\n" +
    "      <ng-include src=\"options.tagTemplateUrl\"></ng-include>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <span class=\"container-fluid\" data-ng-show=\"toggles.inputActive\">\n" +
    "    <input ng-if=\"!srcTags.length\"\n" +
    "           type=\"text\"\n" +
    "           data-ng-model=\"inputTag\"\n" +
    "           class=\"decipher-tags-input\"/>\n" +
    "    <!-- may want to fiddle with limitTo here, but it was inhibiting my results\n" +
    "    so perhaps there is another way -->\n" +
    "    <input ng-if=\"srcTags.length\"\n" +
    "           type=\"text\"\n" +
    "           data-ng-model=\"inputTag\"\n" +
    "           class=\"decipher-tags-input\"\n" +
    "           data-typeahead=\"stag as stag.name for stag in srcTags|filter:$viewValue|orderBy:orderBy\"\n" +
    "           data-typeahead-on-select=\"add($item); selectArea()\"\n" +
    "           data-typeahead-editable=\"allowsEditable\"/>\n" +
    "\n" +
    "  </span>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tag.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tag.html",
    "<span class=\"decipher-tags-tag\"\n" +
    "      data-ng-class=\"getClasses(tag)\">{{tag.name}}\n" +
    "      <i class=\"icon-remove\"\n" +
    "         data-ng-click=\"remove(tag)\">\n" +
    "      </i>\n" +
    "</span>\n" +
    "");
}]);
