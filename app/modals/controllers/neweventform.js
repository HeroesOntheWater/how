/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:NewEventFormCtrl
 * @description
 * # NewEventFormCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('NewEventFormCtrl', function(
    $q,
    eventData,
    $scope,
    $uibModalInstance,
    $uibModal,
    commonServices,
    userService,
    $rootScope
  ) {
    'use strict';

    $scope.initialize = function() {
      // Initialize scope values.
      $('#phonenum').mask('(999)999-9999');
      $('#zip').mask('99999');
      $scope.isEdit = eventData.isEdit;
      $scope.newEvent = eventData.event || {};
      $scope.step = eventData.step;
      $scope.chapters = $scope.siteData.chapters;
      $scope.isAdmin = false;

      // Set Admin flag.
      if (userService.getRole() === 'National Staff') {
        $scope.isAdmin = true;
      }

      // Load default values for drop downs.
      if (!$scope.isEdit) {
        $scope.newEvent.chapter = userService.getChapter();
        $scope.newEvent.eventOwner = {
          key: userService.getId(),
          name: userService.getUserName(),
          email: userService.getUserEmail(),
        };
        $scope.newEvent.eventManager = {
          key: userService.getId(),
          name: userService.getUserName(),
          email: userService.getUserEmail(),
        };
      } else {
        $scope.st = new Date($scope.newEvent.startTime);
        $scope.et = new Date($scope.newEvent.endTime);
      }

      $scope.stateIds = $scope.siteData.states;

      // Update user lists.
      $scope.eventManagerUpdate($scope.newEvent.chapter, false);
    };

    // handles getting data for Event Manager and Event Owner Drop downs.
    $scope.eventManagerUpdate = function(selectedChapter, isChanged) {
      // Get User for the selected chapter.
      var newDataSet = commonServices.queryChapterkey(selectedChapter.key);
      var newRoleData = commonServices.getData('/userRoles/');
      $scope.eventManagerList = [];
      $scope.eventOwnerList = [];

      // Run promise.
      $q.all([newDataSet, newRoleData]).then(function(userData) {
        _.each(userData[1], function(userRole, userKey1) {
          if (userRole.role !== 'Participant') {
            _.each(userData[0], function(chapterUser, userKey2) {
              if (userKey1 === userKey2) {
                // Event User Object.
                var eventUserObj = {
                  key: userKey2,
                  name: chapterUser.name.first + ' ' + chapterUser.name.last,
                  email: chapterUser.email,
                };

                // Volunteers cannot be owners.
                if (userRole.role === 'Volunteer') {
                  $scope.eventManagerList.push(eventUserObj);
                } else {
                  $scope.eventOwnerList.push(eventUserObj);
                  $scope.eventManagerList.push(eventUserObj);
                }
              }
            });
          }
        });

        // Load default if no users found
        if (_.isEmpty($scope.eventOwnerList)) {
          $scope.eventOwnerList.push({
            key: false,
            name: ' -- CHAPTER OWNER UNAVAILABLE --',
          });
        }

        // Load default if no users found
        if (_.isEmpty($scope.eventManagerList)) {
          $scope.eventManagerList.push({
            key: false,
            name: ' -- CHAPTER MANAGER UNAVAILABLE --',
          });
        }

        // Set defaults.
        if (!$scope.isEdit || isChanged) {
          $scope.newEvent.eventOwner = $scope.eventOwnerList[0];
          $scope.newEvent.eventManager = $scope.eventManagerList[0];
        }
      });
    };

    // Date time picker options
    $scope.stPopup = {
      opened: false,
    };

    $scope.open = function() {
      $scope.stPopup.opened = true;
    };

    $scope.etPopup = {
      opened: false,
    };

    $scope.open2 = function() {
      $scope.etPopup.opened = true;
    };

    // event status radio data
    $scope.states = ['upcoming-open', 'upcoming-closed', 'in-session', 'past'];

    // empty submit object
    $scope.newEvent = $scope.newEvent || {};

    $scope.postEvent = function() {
      var result = null;
      // submit form
      $scope.newEvent.startTime = $scope.st.getTime();
      $scope.newEvent.endTime = $scope.et.getTime();
      $scope.newEvent.initiator = $rootScope.userId;

      if (!$scope.isEdit) {
        $scope.newEvent.status = 'upcoming-open';
        delete $scope.newEvent.chapter['$$hashKey'];
        var newEventKey = commonServices.getNewKey('/events/');

        // Generate New Key, and save with event object.
        $q.all([newEventKey]).then(function(eventKey) {
          if (eventKey[0]) {
            $scope.newEvent.key = eventKey[0];
            commonServices.updateData(
              '/events/' + eventKey[0],
              $scope.newEvent
            );
          } else {
            swal({
              text: 'Failed to generate event key',
              type: 'error',
              timer: 2500,
            });
          }
        });

        $scope.cancel();
      } else {
        var key = $scope.newEvent['key'];
        delete $scope.newEvent['$$hashKey'];
        result = commonServices.updateData('/events/' + key, $scope.newEvent);
        $scope.cancel();
        swal({
          text: 'Saving Event Update',
          type: 'success',
          timer: 2500,
        });
      }
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
      if ($scope.step === 'public') {
        var modalInstance = $uibModal.open({
          templateUrl: '/modals/views/public.events.description.html',
          controller: 'PublicEventsDescriptionCtrl',
          resolve: {
            event: function() {
              return $scope.newEvent;
            },
          },
        });
        $rootScope.$broadcast('updateEventDescriptionPublic');
      } else {
        $rootScope.$broadcast('updateEventPage');
      }
    };
  });
