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
         'decipher.tags.templates',
         'template/typeahead/typeahead-popup.html']);

      this.$rootScope = $injector.get('$rootScope');
      this.$log = $injector.get('$log');
      this.$compile = $injector.get('$compile');
      this.$templateCache = $injector.get('$templateCache');
      this.scope = this.$rootScope.$new();
      this.$timeout = $injector.get('$timeout');

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
      markup,
      tpl;

    markup = '<tags model="foo"></tags>'
    scope.$apply(function () {
      scope.foo = 'lizards, people';
      tpl = $compile(markup)(scope);
    });

    Q.equal(tpl.find('.decipher-tags-taglist').children().length, 2,
      'formatter works; we have two child tags shown');

    // convert to json via angular to omit $$hashKey
    Q.equal(angular.toJson(tpl.scope().tags), angular.toJson([
      {name: 'lizards'},
      {name: 'people'}
    ]), 'tags are as expected');

    Q.deepEqual(tpl.scope().srcTags, [], 'no src tags');

    Q.equal('lizards, people', scope.foo, 'model is untouched');

    scope.$apply(function () {
      scope.foo = ['frogs', 'geese'];
      tpl = $compile(markup)(scope);
    });

    Q.equal(tpl.find('.decipher-tags-taglist').children().length, 2,
      'an array of strings works fine');

    Q.equal(angular.toJson(tpl.scope().tags), angular.toJson([
      {name: 'frogs'},
      {name: 'geese'}
    ]), 'tags are as expected');


    scope.$apply(function () {
      scope.foo = [
        {name: 'mice'},
        {name: 'deer'}
      ];
      tpl = $compile(markup)(scope);
    });

    Q.equal(tpl.find('.decipher-tags-taglist').children().length, 2,
      'an array of objects works as well');

    Q.equal(angular.toJson(tpl.scope().tags), angular.toJson([
      {name: 'mice'},
      {name: 'deer'}
    ]), 'tags are as expected');


    markup =
    '<tags model="foo" options="{classes: {group: \'groupClass\'}}"></tags>'
    scope.$apply(function () {
      scope.foo = [
        {name: 'owls', group: 'group'},
        {name: 'cheese', group: 'group'}
      ];
      tpl = $compile(markup)(scope);
    });
    Q.equal(tpl.find('.groupClass').length,
      2, 'group classes get set');

    Q.equal(angular.toJson(tpl.scope().tags), angular.toJson([
      {name: 'owls', group: 'group'},
      {name: 'cheese', group: 'group'}
    ]), 'tags are as expected');

    tpl.find('.icon-remove').click();

    Q.equal(tpl.find('.decipher-tags-taglist').children().length, 0,
      'remove button works');

    // assert sorting works
    scope.$apply(function () {
      scope.foo = [
        {name: 'owls', group: 'group'},
        {name: 'cheese', group: 'group'}
      ];
      tpl = $compile(markup)(scope);

      scope.$broadcast('decipher.tags.sort', 'name');
    });

    Q.equal(tpl.find('.decipher-tags-tag:first').text().trim(), 'cheese',
      'we sorted since "cheese" is first');

    // let's play with src
    markup = '<tags model="foo" src="honky cat"</tags>';
    Q.raises(function () {
      $compile(markup)(scope);
    }, 'error thrown if bad src');

    markup =
    '<tags model="foo" src="s as s.name for s in stuff"></tags>';
    scope.$apply(function () {
      var chickens = {value: 1, name: 'chickens', foo: 'bar'};
      scope.foo = [chickens];
      scope.stuff = [
        chickens,
        {value: 2, name: 'steer', foo: 'baz'}
      ];
      tpl = $compile(markup)(scope);
    });
    this.$timeout.flush();

    //TODO: assert our srctags have no chickens

    markup =
    '<tags model="foo" src="s as s.name for s in stuff"></tags>';
    scope.$apply(function () {
      var chickens = {id: 1, name: 'chickens', foo: 'bar'};
      scope.foo = [chickens];
      scope.stuff = [
        chickens,
        {id: 2, name: 'steer', foo: 'baz'}
      ];
      tpl = $compile(markup)(scope);
    });

    // TODO: assert id doesn't bust things

    markup =
    '<tags model="foo" src="s as s.name for s in stuff"></tags>';
    scope.$apply(function () {
      scope.foo = [
        {name: 'owls', group: 'group'},
        {name: 'cheese', group: 'group'}
      ];
      scope.stuff = [
        {value: 1, name: 'chickens', foo: 'bar'},
        {value: 2, name: 'steer', foo: 'baz'}
      ];
      tpl = $compile(markup)(scope);
    });

    Q.deepEqual(tpl.scope().srcTags, [
      {
        "group": undefined,
        "name": "chickens",
        "value": 1,
        "foo": "bar"
      },
      {
        "group": undefined,
        "name": "steer",
        "value": 2,
        "foo": "baz"
      }
    ], 'src tags are parsed correctly');

    Q.equal(tpl.find('.typeahead').length, 1,
      'typeahead popup is injected into DOM');

    // since it's a bitch to try and use jquery to work with typeahead
    // just pretend it's there and run the cb.

    // reset this since selectarea should make it true
    scope.$apply('toggles.inputActive = false');

    scope.$apply(function () {
      tpl.scope().add(tpl.scope().srcTags[0]);
      tpl.scope().selectArea();
    });

    Q.deepEqual(angular.toJson(tpl.scope().tags), angular.toJson([
      {
        "name": "owls",
        "group": "group"
      },
      {
        "name": "cheese",
        "group": "group"
      },
      {
        "value": 1,
        "name": "chickens",
        "foo": "bar"
      }
    ]), 'tags now include "chickens"');

    // srcTags splice happens in a timeout, so flush it.
    this.$timeout.flush();
    Q.equal(tpl.scope().srcTags.length, 1, '"chickens" removed from srcTags');
    Q.ok(tpl.scope().toggles.inputActive, 'input is active');
  });


})();
