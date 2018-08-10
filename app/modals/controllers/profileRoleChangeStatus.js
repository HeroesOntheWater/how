/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ProfileRoleChangeStatus
 * @description
 * # ProfileRoleChangeStatus
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('ProfileRoleChangeStatus', function(
    $rootScope,
    $q,
    userService,
    commonServices,
    $scope,
    $uibModalInstance,
    $http
  ) {
    'use strict';

    // Get all current requests for given user.
    $scope.getUserRequests = function() {
      $scope.pendingRequests = [];
      $scope.approvedRequests = [];
      $scope.declinedRequests = [];
      var servicePromise = commonServices.getUserRequests(userService.getId());
      $q.all([servicePromise]).then(function(data) {
        _.each(data[0], function(req, key) {
          req.key = key;
          if (req.request_status === 'pending') {
            $scope.pendingRequests.push(req);
          } else if (req.request_status === 'Approved') {
            $scope.approvedRequests.push(req);
          } else {
            $scope.declinedRequests.push(req);
          }
        });
      });
    };

    // Close modal
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    // Delete request
    $scope.deleteRequest = function(key) {
      swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then(function() {
        swal('Deleted!', 'Your request has been deleted.', 'success').then(
          function() {
            commonServices.removeData('/roleChangeRequests/' + key);
            $scope.getUserRequests(userService.getId());
          }
        );
      });
    };
  });
