angular-tags [![Build Status](https://travis-ci.org/decipherinc/angular-tags.png?branch=master)](https://travis-ci.org/decipherinc/angular-tags)
============

Pure AngularJS tagging widget with typeahead support courtesy of [ui-bootstrap](http://angular-ui.github.io/bootstrap).

Current Version
---------------
```
0.2.10
```

Installation
------------
```
bower install angular-tags
```

Requirements
------------

- [AngularJS](http://angularjs.org)
- [ui-bootstrap](http://angular-ui.github.io/bootstrap) (ui.bootstrap.typeahead module)
- [Bootstrap CSS](http://getbootstrap.com) (optional)
- [Font Awesome](http://fortawesome.github.io/Font-Awesome/) (optional)

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

### Demo

<a href="http://decipherinc.github.io/angular-tags">Demo here</a>.


### Setup

angular-tags comes in two versions; one with embedded templates and another without.  Without templates:

```html
<script src="/path/to/angular-tags-VERSION.js"></script>
```

With templates:

```html
<script src="/path/to/angular-tags-VERSION-tpls.js"></script>
```

You will also want to include the CSS if you are using this version:

```html
<link rel="stylesheet" href="/path/to/angular-tags-VERSION.css"/>
```

Templates are included in the `templates/` directory if you want to load them manually and/or modify them.

You'll also need to make sure you have included the ui-bootstrap source.

Finally, include the module in your code, and the required `ui.bootstrap.typeahead` module:

```javascript
angular.module('myModule', ['decipher.tags', 'ui.bootstrap.typeahead'];
```

### Directive

This is a directive, so at its most basic:

```html
<tags model="foo"></tags>
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

With Typeahead
--------------

The above directive usage will not use the typeahead functionality of ui-bootstrap.  To use the typehead functionality, which provides a list of tags from which to choose, you have to specify some values to read from:

```html
<tags model="foo" src="b as b.name for b in baz"></tags>
```

The value of `src` is a comprehension expression, like found in [ngOptions](http://docs.angularjs.org/api/ng.directive:select).  `baz` here should resemble `foo` as above; a delimited string, an array of strings, or an array of objects.  See <a href="#tag-objects">Tag Objects</a> below.

*Note*: Here we're using `b` (the entire object) for the value; feel free to use something else, but if we use `b`, the directive will retain any *extra data* you have put in the tag objects:

```javascript
baz = [
  {foo: 'bar', value: 'baz', name: 'derp'},
  {foo: 'spam', value: 'baz', name: 'herp'},
]
```

and

```html
<tags model="foo" src="b.value as b.name for b in baz"></tags>
```

The resulting source tags will look like this:

```javascript
baz = [
  {value: 'baz', name: 'derp'},
  {value: 'baz', name: 'herp'},
]
```

Basically, whatever you set here will become the `value` of these tags unless you specify an entire object.

### Typeahead Options

You can pass options through to the typeahead module.  Simply pass a `typeahead-options` attribute to the `<tags>` element.  Available options are shown here:

```javascript
$scope.typeaheadOpts = {
  inputFormatter: myInputFormatterFunction,
  loading: myLoadingBoolean,
  minLength: 3,
  onSelect: myOnSelectFunction, // this will be run in addition to directive internals
  templateUrl: '/path/to/my/template.html',
  waitMs: 500,
  allowsEditable: true
};
```

and:

```html
<tags typeahead-options="typeaheadOpts" model="foo" src="b.value as b.name for b in baz"></tags>
```

Tag Objects
-----------

Tag objects have three main properties:

- `name` The name (display name) of the tag
- `group` (optional) The "group" of the tag, for assigning class names
- `value` (optional) The "value" of the tag, which is not displayed

Tag objects can include any other properties you wish to add.

Options
-----------

### Global Options

To set defaults module-wide, inject the `decipherTagsOptions` constant into anything and modify it:

```javascript
myModule.config(function(decipherTagsOptions) {
  decipherTagsOptions.delimiter = ':';
  decipherTagsOptions.classes = {
    myGroup: 'myClass',
    myOtherGroup: 'myOtherClass'
  };
});
```

### Available Options

- `addable` whether or not the user is allowed to type arbitrary tags into the input (defaults to `false` by default if a `src` is supplied, otherwise defaults to `true`; see <a href="#adding-tags">Adding Tags</a> below.
- `delimiter` what to use for a delimiter when typing or pasting into the input.  Defaults to `,`
- `classes` An object mapping of group names to class names
- `templateUrl` URL to the main template. Defaults to `templates/tags.html`
- `tagTemplateUrl` URL to the "tag" template. Defaults to `templates/tag.html`

#### Adding Tags

If you neglect to supply a `src` (thus not using typeahead) you will be able to enter whatever you like into the tags input, adding tags willy-nilly.  If you *do* supply a `src`, by default the user will be limited to what's in the list.  You can override this by passing an `addable` property to the options:

```html
<tags options="{addable: true}" model="foo" src="b as b.name for b in baz"></tags>
```

#### Classes

If you specify classes, your tags will each be assigned a class name based on the group.  For example:

```html
<tags options="{classes: {myGroup: 'myClass'}}" model="foo" src="b as b.name for b in baz></tags>
```

Now when a tag is added to the list, *and* that tag has the `group` of `myGroup`, it will receive the `myClass` class.  This is useful if you want to change the color of certain tags or something.

Events
------

The directive will emit certain events based on what's going on:

- `decipher.tags.initialized`: Emitted when the directive is linked.  Data will include a unique `$id` value of the directive and the original `model` value.
- `decipher.tags.keyup`: Emitted when the user types something into the input.  Data will include the unique `$id` and the `value`, which is what the user has typed so far.  You can attach to this to do validation or anything else.
- `decipher.tags.added`: Emitted when the user has successfully added a tag.  Data will include the unique `$id` and a `tag` object representing the tag added.
- `decipher.tags.addfailed`: Emitted when the user tries to add a tag that is not available for whatever reason.  This will occur if the user attempts to add a duplicate tag, or if they attempt to add a tag that is not in the supplied `src` list.  Data will include the unique `$id` and a `tag` object representing the tag that failed to be added.
- `decipher.tags.removed`: Emitted when the user removes a tag, either via backspacing or clicking on the little `x` in the tag.  Data will include the unique `$id` and a `tag` object representing the tag removed.

License
=======

MIT

Authors
=======

Carl Dougan (@carlsgit) and Christopher Hiller (@boneskull)
