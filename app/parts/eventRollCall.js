/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:EventRollCall
 * @description
 * # EventRollCall
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('EventRollCall', function(
    eventData,
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance,
    $uibModal
  ) {
    'use strict';

    $scope.eventData = eventData;

    $scope.initialize = function() {
      
      if (!_.isUndefined($scope.eventData.type) && $scope.eventData.type === 'participants') {
        $scope.selectedOption = {
          value: 'participants',
          text: 'Participants'
        };
      } else if (!_.isUndefined($scope.eventData.type) && $scope.eventData.type === 'volunteers') {
        $scope.selectedOption = {
          value: 'volunteers',
          text: 'Volunteers'
        };
      } else {
        $scope.selectedOption = {
          value: 'all',
          text: 'All'
        };
      }

      $scope.listOptions = [
        {
          value: 'participants',
          text: 'Participants'
        },
        {
          value: 'volunteers',
          text: 'Volunteers'
        },
        {
          value: 'guest',
          text: 'Guests'
        },
        {
          value: 'all',
          text: 'All'
        }
      ];

      $scope.createUserList($scope.selectedOption.value);
    };

    $scope.cancel = function() {
      var getEventData = commonServices.getData(
        'events/' + $scope.eventData.event.key
      );
      $q.all([getEventData]).then(function(data) {
        // Get must recent data for event.
        $scope.eventData.event = data[0];

        // Move user back to manage event for now (change this when we reuse module)
        $uibModalInstance.dismiss('cancel');
        $uibModal.open({
          templateUrl: '/parts/manageParticipants.html',
          controller: 'ManageParticipantsCtrl',
          resolve: {
            eventData: function() {
              return $scope.eventData;
            },
          },
        });
      });
    };

    $scope.getUserData = function(userList) {
      var promiseArray = [];
      if (_.isUndefined(userList) || _.isEmpty(userList)) {
        // Display Error.
        $scope.listEmpty = true;
      } else {
        // Get id for each participant, and create promise.
        var guestList = [];
        var guestCounter = 0;
        _.each(userList, function(user) {
          if (!user.guest) {
            promiseArray.push(
              commonServices.getData('userData/' + user.key)
            );
          }
          guestCounter++;
        });

        // Run promise array and handle returned data.
        $q.all(promiseArray).then(function(data) {

          _.each(data, function(userData) {
            var counter = 0;
            _.each(userList, function(currentUser) {
              if (userData.key === currentUser.key) {
                userList[counter].name = userData.name;
                userList[counter].email = userData.email;
                return false;
              }
              counter++;
            });
          });

          $scope.userList = userList;
          $scope.setColor();
          console.log($scope.userList);
        });
      }
    };

    $scope.isAttending = function(userData) {

      var counter = 0;
      var status = true;
      if (userData.attended) {
        status = false;
      }

      _.each($scope.userList, function(ul) {
        if (ul.key === userData.key) {
          $scope.userList[counter].attended = status;
          $scope.userList[counter].color = (status ? '#d4edda' : '#f8d7da');
          if ($scope.userList.type === 'participant') {
            commonServices.updateData('events/' + $scope.eventData.event.key + '/participants/' + ul.index + '/attended', status);
          } else {
            commonServices.updateData('events/' + $scope.eventData.event.key + '/volunteers/' + ul.index + '/attended', status);
          }
          
          return false;
        }
        counter++;
      });
    };

    $scope.setColor = function() {
      var counter = 0;
      _.each($scope.userList, function(currentUser) {
        $scope.userList[counter].color = (currentUser.attended ? '#d4edda' : '#f8d7da');
        counter++;
      });
    };

    $scope.createUserList = function(listType) {
      var userList = [];
      var counter = 0;
      if (listType === 'participants') {
        _.each($scope.eventData.event.participants, function(partObj) {
          partObj.index = counter;
          partObj.type = 'participant';
          userList.push(partObj);
          counter++;
        });
      } else if (listType === 'volunteers') {
        _.each($scope.eventData.event.volunteers, function(volObj) {
          volObj.index = counter;
          volObj.type = 'volunteer';
          userList.push(volObj);
          counter++;
        });
      } else if (listType === 'guest') {
        _.each($scope.eventData.event.participants, function(guestObj) {
          if (guestObj.guest) {
            guestObj.index = counter;
            guestObj.type = 'participant';
            userList.push(guestObj);
          }
          counter++;
        });
      } else {
        _.each($scope.eventData.event.participants, function(partObj) {
          partObj.index = counter;
          partObj.type = 'participant';
          userList.push(partObj);
          counter++;
        });
        counter = 0;
        _.each($scope.eventData.event.volunteers, function(volObj) {
          volObj.index = counter;
          volObj.type = 'volunteer';
          userList.push(volObj);
          counter++;
        });
      }

      $scope.getUserData(userList);

    };

    
  });
