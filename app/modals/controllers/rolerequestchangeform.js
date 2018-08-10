/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:RoleRequestChangeFormCtrl
 * @description
 * # RoleRequestChangeFormCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('RoleRequestChangeFormCtrl', function(
    $rootScope,
    $q,
    userService,
    commonServices,
    $scope,
    $uibModalInstance
  ) {
    'use strict';

    $scope.userData = userService.getUserData();
    $scope.currentUID = userService.getId();
    $scope.currentUserRole = userService.getRole();

    $scope.formData = {
      role: '',
      comment: '',
    };

    $scope.roles = $rootScope.siteData.roles;

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.submitForm = function() {
      if ($scope.formData.role.value) {
        var userRequests = commonServices.getData('/roleChangeRequests/');
        var canContinue = true;
        var errorMessage = '';
        $q.all([userRequests]).then(function(data) {
          if ($scope.currentUserRole !== $scope.formData.role.value) {
            _.each(data[0], function(value) {
              if (
                value.uid === $scope.currentUID &&
                value.request_status === 'pending'
              ) {
                canContinue = false;
                errorMessage =
                  'You can only have one pending request at a time, you need to wait or delete current pending request...';
              }
            });
          } else {
            canContinue = false;
            errorMessage =
              'You are not allowed to make a request for a role you already have...';
          }

          if (canContinue) {
            var newTS = Date.now();
            var packet = {
              uid: $scope.currentUID,
              name:
                $scope.userData.name.first + ' ' + $scope.userData.name.last,
              email: $scope.userData.email,
              current_role: $scope.currentUserRole,
              request_role: $scope.formData.role.value,
              user_comment: $scope.formData.comment || 'none',
              admin_comment: '',
              request_status: 'pending',
              request_created: newTS,
              request_updated: newTS,
              request_closed: '',
            };
            commonServices.pushData('/roleChangeRequests/', packet);
            $rootScope.$broadcast('modalClosing');
            $uibModalInstance.dismiss('cancel');
            swal(
              'Success',
              'Role Change Request created successfully',
              'success'
            );
          } else {
            swal('Error', errorMessage, 'error');
          }
        });
      } else {
        swal('Error', 'Role Change Request was not created...', 'error');
      }
    };
  });
