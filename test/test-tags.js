/*global angular, sinon, QUnit, $*/
(function () {
  'use strict';

  var Q = QUnit;

  function getArgs(spy, num) {
    return JSON.stringify(spy.getCall(num).args);
  }

  var init = {
    setup: function () {
      var $injector = angular.injector(
        ['ng',
         'decipher.tags',
         'ngMock',
         'templates-main',
         'template/typeahead/typeahead-popup.html']);

      this.$rootScope = $injector.get('$rootScope');
      this.$log = $injector.get('$log');
      this.$compile = $injector.get('$compile');
      this.$templateCache = $injector.get('$templateCache');
      this.scope = this.$rootScope.$new();

      this.sandbox = sinon.sandbox.create('taglist');

    },
    teardown: function () {

      this.sandbox.restore();
    }
  };

  Q.module('tags directive', init);

  Q.test('taglist', function () {
    var scope = this.scope,
      $compile = this.$compile,
      markup = '<tags></tags>',
      tpl;

    Q.raises(function () {
      $compile(markup)(scope);
      scope.$apply();
    }, 'tags fails if no ngModel');

    markup = '<tags ng-model="foo"></tags>'
    scope.$apply(function () {
      scope.foo = 'lizards, people';
      tpl = $compile(markup)(scope);
    });

    Q.equal(tpl.find('.decipher-tags-taglist').children().length, 2,
      'formatter works; we have two child tags shown');

    scope.$apply(function () {
      scope.foo = ['frogs', 'geese'];
      tpl = $compile(markup)(scope);
    });

    Q.equal(tpl.find('.decipher-tags-taglist').children().length, 2,
      'an array of strings works fine');

    scope.$apply(function () {
      scope.foo = [
        {value: 'mice'},
        {value: 'deer'}
      ];
      tpl = $compile(markup)(scope);
    });

    Q.equal(tpl.find('.decipher-tags-taglist').children().length, 2,
      'an array of objects works as well');

    markup =
    '<tags ng-model="foo" options="{classes: {group: \'groupClass\'}}"></tags>'
    scope.$apply(function () {
      scope.foo = [
        {value: 'owls', group: 'group'},
        {value: 'cheese', group: 'group'}
      ];
      tpl = $compile(markup)(scope);
    });

    Q.equal(tpl.find('.groupClass').length,
      2, 'group classes get set');

    tpl.find('.icon-remove').click();

    Q.equal(tpl.find('.decipher-tags-taglist').children().length, 0,
      'remove button works');

    // let's play with src

    markup = '<tags ng-model="foo" src="honky cat"</tags>';
    Q.raises(function() {
      $compile(markup)(scope);
    }, 'error thrown if bad src');

    markup =
    '<tags ng-model="foo" src="s.value as s.name for s in stuff"></tags>';
    scope.$apply(function () {
      scope.stuff = [
        {value: 1, name: 'chickens'},
        {value: 2, name: 'steer'}
      ];
      tpl = $compile(markup)(scope);
    });

    Q.equal(tpl.find('.typeahead').length, 1, 'typeahead popup is injected into DOM');


  });


})();
