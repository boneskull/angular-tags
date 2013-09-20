(function () {
  'use strict';

  angular.module('decipher.tags.github.io',
      ['decipher.tags', 'ui.bootstrap.tpls'])
    .controller('MainCtrl', function ($scope) {

      $scope.tags = [

        {
          name: 'beef', group: 'red'
        },
        {
          name: 'chicken', group: 'white'
        }
      ];

      $scope.sourceTags = $scope.tags.concat([
        {
          name: 'pork', group: 'red'
        },
        {
          name: 'lamb', group: 'red'
        },
        {
          name: 'turkey', group: 'white'
        },
        {
          name: 'bison', group: 'red'
        },
        {
          name: 'mutton', group: 'red'
        }
      ]);

    });
})();
