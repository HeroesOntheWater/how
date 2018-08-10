/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:NewuserdirectoryformCtrl
 * @description
 * # NewuserdirectoryformCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('EventaddinventoryCtrl', function(
    $scope,
    $location,
    $uibModalInstance,
    Api
  ) {
    'use strict';

    // calendar options

    $scope.popup = {
      opened: false,
    };

    $scope.open = function() {
      $scope.popup.opened = true;
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
