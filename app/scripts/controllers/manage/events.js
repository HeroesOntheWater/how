/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of management console - events
 */
angular
  .module('ohanaApp')
  .controller('EventsCtrl', function(
    $q,
    commonServices,
    userService,
    $scope,
    $uibModal,
    $location,
    DAO,
    $rootScope
  ) {
    'use strict';

    $scope.initialize = function() {
      $scope.filter = $scope.filterTypes[0];
    };

    $scope.$on('updateEventPage', function() {
      $scope.initialize();
      $scope.loadAll();
    });

    $scope.newQuery = {};
    var allEvents = [];

    $scope.filterTypes = ['All', 'Past', 'Upcoming'];
    $scope.filter = {};

    // var canvas = document.getElementById('signatureCanvas');
    // var signaturePad = new SignaturePad(canvas);

    // $scope.clearCanvas = function() {
    //     signaturePad.clear();
    //     $scope.msg = "";
    // }

    // $scope.saveCanvas = function() {
    //     var sigImg = signaturePad.toDataURL();
    //     $scope.signature = sigImg;
    // }

    $scope.loadAll = function() {
      var getEvents = commonServices.getPublicEvents();
      allEvents = [];
      $q.all([getEvents]).then(function(data) {
        if (data[0]) {
          _.each(data[0], function(event, key) {
            event.key = key;
            allEvents.push(event);
          });
          $scope.eventList = allEvents;
        } else {
          console.log('Failed to get Events...');
        }
      });
    };

    $scope.loadAll();

    $scope.changeFilter = function() {
      var getEvents = commonServices.getPublicEvents();
      allEvents = [];
      $q.all([getEvents]).then(function(data) {
        if (data[0]) {
          _.each(data[0], function(event, key) {
            var dateToday = new Date();
            switch ($scope.filter) {
              case 'All':
                event.key = key;
                allEvents.push(event);
                break;
              case 'Past':
                if (event.startTime < dateToday.getTime()) {
                  event.key = key;
                  allEvents.push(event);
                }
                break;
              case 'Upcoming':
                if (event.startTime > dateToday.getTime()) {
                  event.key = key;
                  allEvents.push(event);
                }
                break;
              default:
                break;
            }
          });
          $scope.eventList = allEvents;
        } else {
          console.log('Failed to get Events...');
        }
      });
    };

    $scope.checkCredentials = function(eventObj) {
      var currentUserRole = userService.getRole();
      var resultStatus = false;

      switch (currentUserRole) {
        case 'National Staff':
          resultStatus = true;
          break;
        case 'Chapter Lead':
          var currentUserChapter = userService.getChapter();
          if (eventObj.chapter.key === currentUserChapter.key) {
            resultStatus = true;
          } else {
            resultStatus = false;
          }
          break;
        case 'Volunteer':
          var currentUserId = userService.getId();
          if (eventObj.eventManager.key === currentUserId) {
            resultStatus = true;
          } else {
            resultStatus = false;
          }
          break;
        default:
          resultStatus = false;
          break;
      }

      return resultStatus;
    };

    $scope.search = function() {
      if (allEvents.length > 0) {
        $scope.empty = false;

        if ($scope.newQuery.search == '*' || !$scope.newQuery.search) {
          $scope.loadAll();
        } else {
          var eventsFound = [];
          _.each(allEvents, function(event) {
            _.each(event, function(attribute) {
              if (
                angular.isString(attribute) &&
                angular.isString($scope.newQuery.search)
              ) {
                if (
                  _.includes(
                    attribute.toLowerCase(),
                    $scope.newQuery.search.toLowerCase()
                  )
                ) {
                  eventsFound.push(event);
                  return false;
                }
              } else if (_.includes(attribute, $scope.newQuery.search)) {
                eventsFound.push(event);
                return false;
              }
            });
          });
          if (eventsFound.length == 0) {
            console.log('no results');
            $scope.empty = true;
            $scope.noEventsFound =
              'No results for ' + $scope.newQuery.search + ' found.';
          }
          $scope.eventList = eventsFound;
        }
      }
    };

    $scope.add = function() {
      $uibModal.open({
        templateUrl: '/modals/views/newEventForm.html',
        controller: 'NewEventFormCtrl',
        backdrop: 'static',
        resolve: {
          eventData: function() {
            return {
              event: false,
              isEdit: false,
              step: 'admin',
            };
          },
        },
      });
    };

    $scope.edit = function(event) {
      $uibModal.open({
        templateUrl: '/modals/views/newEventForm.html',
        controller: 'NewEventFormCtrl',
        backdrop: 'static',
        resolve: {
          eventData: function() {
            return {
              event: event,
              isEdit: true,
              step: 'admin',
            };
          },
        },
      });
    };

    $scope.viewAttendees = function(event, type) {
      $uibModal.open({
        templateUrl: '/modals/views/manageParticipants.html',
        controller: 'ManageParticipantsCtrl',
        backdrop: 'static',
        resolve: {
          eventData: function() {
            return {
              event: event,
              step: 'admin',
              type: type,
            };
          },
        },
      });
    };

    $scope.getKeyLength = function(obj) {
      return obj ? Object.keys(obj).length : 0;
    };

    $scope.deleteEvent = function(index) {
      var selected = allEvents[index];

      swal({
        title: 'Are you sure?',
        text: 'You will not be able to recover this event!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: "Yes, delete '" + selected.name + "'",
        cancelButtonText: 'Cancel',
      }).then(
        function(result) {
          console.log('confirm');
          var result = commonServices.removeData('/events/' + selected.key);
          swal({
            text: 'Deleting ' + selected.name,
            type: 'success',
            timer: 2500,
          });
          $q.all([result]).then(function(data) {
            $scope.loadAll();
          });
        },
        function(dismiss) {
          console.log('cancel');
        }
      );
    };
  });
