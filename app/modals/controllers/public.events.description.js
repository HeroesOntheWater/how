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
  .controller('PublicEventsDescriptionCtrl', function(
    event,
    $scope,
    $location,
    $uibModalInstance,
    $rootScope,
    userService,
    $uibModal
  ) {
    'use strict';

    $scope.event = event;
    $scope.isEventManager = false;
    $scope.isEventOwner = false;

    $scope.initialize = function() {
      var userKey = userService.getId();
      if (userKey === $scope.event.eventManager.key) {
        $scope.isEventManager = true;
      }

      if (userKey === $scope.event.eventOwner.key) {
        $scope.isEventOwner = true;
      }
    };

    $scope.$on('updateEventDescriptionPublic', function() {
      $scope.initialize();
    });

    $scope.popup = {
      opened: false,
    };

    $scope.open = function() {
      $scope.popup.opened = true;
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
      $rootScope.$broadcast('updatePublicEventsPage');
    };

    $scope.postRsvp = function() {
      //put join event logic here.
      $uibModalInstance.dismiss('cancel');
    };

    $scope.viewAttendees = function(type) {
      $scope.cancel();
      $uibModal.open({
        templateUrl: '/modals/views/manageParticipants.html',
        controller: 'ManageParticipantsCtrl',
        resolve: {
          eventData: function() {
            return {
              event: $scope.event,
              step: 'public',
              type: type,
            };
          },
        },
      });
    };

    $scope.editEvent = function() {
      $uibModalInstance.dismiss('cancel');
      $uibModal.open({
        templateUrl: '/modals/views/newEventForm.html',
        controller: 'NewEventFormCtrl',
        resolve: {
          eventData: function() {
            return {
              event: $scope.event,
              isEdit: true,
              step: 'public',
            };
          },
        },
      });
    };
  });
