(function () {
  'use strict';

  describe('$tagsProvider', function () {

    beforeEach(function () {
      debaser()
        .module('badwing.tags')
        .module('ui.bootstrap.typeahead')
        .module('badwing.tags.templates')
        .debase();
    });

    describe('provider', function () {
      it('should provide a provider', function () {
        module(function ($tagsProvider) {
          expect($tagsProvider).to.be.an('object');
        });
        inject();
      });

      it('should provide a defaults object', function () {
        module(function ($tagsProvider) {
          expect($tagsProvider.defaults).to.be.an('object');
        });
        inject();
      });

      describe('options()', function () {
        it('should get and set options', function () {
          module(function ($tagsProvider) {
            var opts, more_opts;
            expect($tagsProvider.options).to.be.a('function');
            opts = $tagsProvider.options({bar: 'baz'});
            expect(opts.bar).to.equal('baz');
            more_opts = $tagsProvider.options();
            expect(opts).to.equal(more_opts);
          });
          inject();
        });
      });

    });

    describe('factory', function () {
      var $tags;
      beforeEach(inject(function (_$tags_) {
        $tags = _$tags_;
      }));

      it('should exist', function () {
        expect($tags).to.be.an('object');
      });

      it('should provide a defaults object', function () {
        expect($tags.defaults).to.be.an('object');
      });

      describe('parse()', function () {

        it('should throw if no/bad input', function () {
          expect($tags.parse).to.throw('$tags.parse() expects a string parameter');
          expect(function () {
            $tags.parse('foo bar baz');
          }).to.throw('$tags.parse() expected src specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "foo bar baz"');
        });

        it('should parse w/o "as" syntax', function () {
          var parsed = $tags.parse('foo for bar in baz');
          expect(parsed).to.be.an('object');
          expect(parsed.itemName).to.equal('bar');
          expect(parsed.source).to.be.a('function');
          expect(parsed.sourceName).to.equal('baz');
          expect(parsed.viewMapper).to.be.a('function');
          expect(parsed.modelMapper).to.be.a('function');          
        });

        it('should parse w/ "as" syntax', function () {
          expect(function () {
            $tags.parse('foo as quux for bar in baz');
          }).not.to.throw();
        });
      });


    });


  });

})();

