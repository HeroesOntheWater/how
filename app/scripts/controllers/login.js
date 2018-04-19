/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of public login
 */
angular
  .module('ohanaApp')
  .controller('LoginCtrl', function(
    $q,
    commonServices,
    $scope,
    $rootScope,
    $uibModal,
    $location
  ) {
    'use strict';

    $scope.logObj = {};
    $scope.checkLogin = function(user) {
      var results = commonServices.signin(user);
      $q.all([results]).then(function(data) {
        if (data[0].type === 'SUCCESS') {
          window.location.replace('#/manage/dash');
        } else {
          // Do something here when sign in unsuccessful....
          swal('error', data[0].code + ': ' + data[0].message, 'error');
        }
      });
    };

    $scope.addUser = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/parts/newUserDirectoryForm.html',
        controller: 'NewUserDirectoryFormCtrl',
        backdrop: 'static',
      });
      if (!modalInstance) {
        $scope.update();
      }
    }; // end $scope.addUser

    $scope.passwordReset = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/parts/passwordReset.html',
        controller: 'passwordResetFormCtrl',
      });
      if (!modalInstance) {
        $scope.update();
      }
    }; // end $scope.passwordReset
  });
