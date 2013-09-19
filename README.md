angular-tags [![Build Status](https://travis-ci.org/decipherinc/angular-tags.png?branch=master)](https://travis-ci.org/decipherinc/angular-tags)
============

Pure AngularJS tagging widget with typeahead support courtesy of [ui-bootstrap](http://angular-ui.github.io/bootstrap).

Current Version
---------------
```
0.1.0
```


Installation
------------

```
bower install angular-tags
```

Requirements
------------

- [ui-bootstrap](http://angular-ui.github.io/bootstrap) (ui.bootstrap.typeahead module)

Running Tests
-------------

Clone this repo and execute:

```
npm install
```

to grab the dependencies.  Then execute:

```
grunt test
```

to run the tests.  This will grab the test deps from bower, and run them against QUnit in a local server on port 8000.


Usage
=====

This is a directive, so at its most basic:

```html
<tags ng-model="foo"></tags>
```

This will render the tags contained in `foo` (if anything) and provide an input prompt for more tags.

`foo` can be a delimited string, array of strings, or array of objects with `name` properties:

```javascript
foo = 'foo,bar';
foo = ['foo', 'bar'];
foo = [{name: 'foo', name: 'bar'}];
```

All will render identically.  Depending on the format you use, you will get the same type back when adding tags via the input.  For example, if you add "baz" in the input and your original model happened to be a delimited string, you will get:

```javascript
'foo,bar,baz'
```

Likewise if you had an array of strings:

```javascript
['foo', 'bar', 'baz']
```

The above directive usage will not use the typeahead functionality of ui-bootstrap.  To use the typehead functionality, which provides a list of tags to choose from, you have to specify some values to read from:

```html
<tags ng-model="foo" src="b as b.name for b in baz"></tags>
```

The value of `src` is a comprehension expression, like found in [ngOptions](http://docs.angularjs.org/api/ng.directive:select).  `baz` here should resemble `foo` as above; a delimited string, an array of strings, or an array of objects.
