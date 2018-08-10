/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:changePassword
 * @description
 * # changePassword
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('changePassword', function(
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance
  ) {
    'use strict';

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.changePassword = function(userPass) {
      // Change password request.
      commonServices.changeUserPassword(userPass);

      // Close modal.
      $scope.cancel();
    };
  });
