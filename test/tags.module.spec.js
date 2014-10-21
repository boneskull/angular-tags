(function () {
  'use strict';

  describe('badwing.tags', function () {

    beforeEach(function () {
      debaser()
        .module('ui.bootstrap.typeahead')
        .module('badwing.tags.templates')
        .debase();
    });

    it('exists', function () {
      expect(function () {
       module('badwing.tags');
      }).not.to.throw();
    });

  });
})();
