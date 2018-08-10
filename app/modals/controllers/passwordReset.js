/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:passwordResetFormCtrl
 * @description
 * # passwordResetFormCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('passwordResetFormCtrl', function(
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance
  ) {
    'use strict';

    $scope.userEmail = {
      email: '',
    };

    $scope.popup = {
      opened: false,
    };

    $scope.open = function() {
      $scope.popup.opened = true;
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.resetPassword = function() {
      var pr = commonServices.sendPasswordReset($scope.userEmail);
      $q.all([pr]).then(function(data) {
        console.log(data);
        if (data[0]) {
          $uibModalInstance.dismiss('cancel');
          swal(
            'Request sent!',
            'Check your email for instructions to reset your password',
            'success'
          );
        } else {
          swal('Request Failed...', 'Email does not exist', 'error');
        }
      });
    };
  });
