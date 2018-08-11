/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:emailUsers
 * @description
 * # emailUsers
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('emailUsers', function(
    emailData,
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance,
    $uibModal,
    $http
  ) {
    'use strict';

    console.log(emailData);

    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.sendEmail = () => {
        var emailPromise = commonServices.emailService();
        $q.all([emailPromise]).then(function(data) {
            if (data[0]) {
                // success here
            };
        });
    };

   
  });
