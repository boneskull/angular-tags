var tagsDirective = function tagsDirective(options) {

  return {
    restrict: 'E',
    controller: 'TagsController',
    require: 'ngModel',
    replace: true,
    // IE8 is really, really fussy about this.
    template: '<div><div data-ng-include="\'' + options.template_path + '\'"></div></div>'
  };
};
tagsDirective.$inject = ['badwing.tags.options'];

tags.directive('tags', tagsDirective);
