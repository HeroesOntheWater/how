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
  .controller('PublicEventsCtrl', function(
    $q,
    commonServices,
    $scope,
    $uibModal,
    Api,
    userService,
    $filter,
    $rootScope
  ) {
    'use strict';
    $scope.newQuery = {};
    $scope.userService = userService;
    // $scope.volunteerIsDisabled = false;
    $scope.allVolunteerIsDisableds = [];
    $scope.allParticipantIsDisableds = [];
    $scope.selected = null;

    $scope.loadAll = function() {
      var getEvents = commonServices.getPublicEvents();
      $q.all([getEvents]).then(function(data) {
        if (data[0]) {
          $scope.eventList = [];
          _.each(data[0], function(val, idx) {
            var isParticipant = $scope.isUserParticipant(val);
            var isVolunteer = $scope.isUserVolunteer(val);

            $scope.allVolunteerIsDisableds.push({
              key: idx,
              isDisabled: isVolunteer,
            });
            $scope.allParticipantIsDisableds.push({
              key: idx,
              isDisabled: isParticipant,
            });
            val.key = idx;
            $scope.eventList.push(val);
          });
          $scope.eventList2 = angular.copy($scope.eventList);
        } else {
          console.log('Failed to get Events...');
        }
      });
    };

    $scope.isUserParticipant = function(pList) {
      var currentId = userService.getId();
      var checkStatus = false;
      _.each(pList.participants, function(par) {
        if (currentId === par.key) {
          checkStatus = true;
          return;
        }
      });
      return checkStatus;
    };

    $scope.isUserVolunteer = function(vList) {
      var currentId = userService.getId();
      var checkStatus = false;
      _.each(vList.volunteers, function(vol) {
        if (currentId === vol.key) {
          checkStatus = true;
          return;
        }
      });
      return checkStatus;
    };

    $scope.$on('updatePublicEventsPage', function() {
      $scope.loadAll();
    });

    $scope.loadAll();

    $scope.popup1 = {
      opened: false,
    };
    $scope.popup2 = {
      opened: false,
    };

    $scope.$watch('dt', function(val) {
      $scope.filtersRunner();
    });

    $scope.$watch('dt2', function(val) {
      $scope.filtersRunner();
    });

    $scope.filtersRunner = function() {
      $scope.search();
      if ($scope.dt) $scope.dateMath($scope.dt.getTime(), 'lower');
      if ($scope.dt2) $scope.dateMath($scope.dt2.getTime(), 'upper');
    };

    $scope.dateMath = function(date, bound) {
      switch (bound) {
        case 'lower':
          var lower_res = {};
          console.log($scope.eventList);
          Object.keys($scope.eventList).forEach(function(val, idx) {
            var evtObjToSearch = $scope.eventList[val];
            if (date <= evtObjToSearch['startTime'])
              lower_res[val] = $scope.eventList[val];
          });
          $scope.eventList = lower_res;
          break;
        case 'upper':
          var upper_res = {};
          console.log($scope.eventList);
          Object.keys($scope.eventList).forEach(function(val, idx) {
            var evtObjToSearch = $scope.eventList[val];
            if (evtObjToSearch['startTime'] <= date)
              upper_res[val] = $scope.eventList[val];
          });
          $scope.eventList = upper_res;
          break;
      }
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      minDate: new Date(),
      startingDay: 1,
    };
    $scope.open = function() {
      $scope.popup1.opened = true;
    };
    $scope.open2 = function() {
      $scope.popup2.opened = true;
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];
    $scope.search = function() {
      if (!$scope.newQuery.search) {
        $scope.eventList = $scope.eventList2;
        return;
      }

      var res = {};
      Object.keys($scope.eventList2).forEach(function(val, idx) {
        var evtObjToSearch = $scope.eventList2[val];
        for (var key in evtObjToSearch) {
          if (evtObjToSearch.hasOwnProperty(key)) {
            //string search match
            if (
              typeof evtObjToSearch[key] === 'string' &&
              evtObjToSearch[key].toLowerCase().includes($scope.newQuery.search)
            ) {
              res[val] = $scope.eventList2[val];
            } else if (
              typeof evtObjToSearch[key] === 'number' &&
              evtObjToSearch[key]
                .toString()
                .toLowerCase()
                .includes($scope.newQuery.search)
            ) {
              //match numbers
              res[val] = $scope.eventList2[val];
            }
          }
        }
      });
      $scope.eventList = res;
    };

    $scope.showDescription = function(index) {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/public.events.description.html',
        controller: 'PublicEventsDescriptionCtrl',
        resolve: {
          event: function() {
            return $scope.eventList[index];
          },
        },
      });
    };

    // $scope.showDescription = function(index) {
    //   $scope.selected = $scope.eventList[index];
    //   console.log('Index is: ', index);
    //   var getEvents = commonServices.getEvent(index);

    //   $q.all([getEvents]).then(function(data) {
    //     if (data[0]) {
    //       _.each(data[0], function(event) {
    //         if ($scope.selected.email === event.email) {
    //           console.log('Event: ' + event.name);
    //           $scope.selected = event;
    //         }
    //       });
    //     } else {
    //       $scope.selected = null;
    //     }
    //   });
    //   if ($scope.selected != null) {
    //     var modalInstance = $uibModal.open({
    //       scope: $scope,
    //       templateUrl: '/parts/public.events.description.html',
    //       controller: 'PublicEventsDescriptionCtrl',
    //     });
    //   }
    // };

    $scope.addVolunteer = function(key, idx) {
      if ($scope.allVolunteerIsDisableds[idx]['isDisabled'] !== true) {
        // Create volunteer object.
        var pObj = {
          key: userService.getId(),
          guest: false,
        };

        // Check to see if volunteers list exists, and set default if it does not.
        if (
          _.isEmpty($scope.eventList[key].volunteers) ||
          _.isUndefined($scope.eventList[key].volunteers)
        ) {
          $scope.eventList[key].volunteers = [];
        }

        // Add user to current volunteers, and update list on backend.
        $scope.eventList[key].volunteers.push(pObj);
        commonServices.updateData(
          'events/' + $scope.eventList[key].key + '/volunteers',
          $scope.eventList[key].volunteers
        );

        // Check if user is already a participant.
        if ($scope.allParticipantIsDisableds[idx]['isDisabled']) {
          $scope.removeParticipant(key, idx);
        }

        // Change button.
        $scope.allVolunteerIsDisableds[idx]['isDisabled'] = true;
      } else {
        $scope.removeVolunteer(key, idx);
      }
    };

    $scope.removeVolunteer = function(key, idx) {
      // Update current list.
      var userId = userService.getId();
      $scope.eventList[key].volunteers = _.filter(
        $scope.eventList[key].volunteers,
        function(par) {
          return par.key !== userId;
        }
      );

      commonServices.updateData(
        'events/' + $scope.eventList[key].key + '/volunteers',
        $scope.eventList[key].volunteers
      );

      // Update button.
      $scope.allVolunteerIsDisableds[idx]['isDisabled'] = false;
    };

    $scope.addParticipant = function(key, idx) {
      if ($scope.allParticipantIsDisableds[idx]['isDisabled'] !== true) {
        // Create participant object.
        var pObj = {
          key: userService.getId(),
          guest: false,
        };

        // Check to see if participant list exists, and set default if it does not.
        if (
          _.isEmpty($scope.eventList[key].participants) ||
          _.isUndefined($scope.eventList[key].participants)
        ) {
          $scope.eventList[key].participants = [];
        }

        // Add user to current participant, and update list on backend.
        $scope.eventList[key].participants.push(pObj);
        commonServices.updateData(
          'events/' + $scope.eventList[key].key + '/participants',
          $scope.eventList[key].participants
        );

        // Check if user is already a volunteer.
        if ($scope.allVolunteerIsDisableds[idx]['isDisabled']) {
          $scope.removeVolunteer(key, idx);
        }

        // Update button.
        $scope.allParticipantIsDisableds[idx]['isDisabled'] = true;
      } else {
        $scope.removeParticipant(key, idx);
      }
    };

    $scope.removeParticipant = function(key, idx) {
      // Update current list.
      var userId = userService.getId();
      $scope.eventList[key].participants = _.filter(
        $scope.eventList[key].participants,
        function(par) {
          return par.key !== userId;
        }
      );

      commonServices.updateData(
        'events/' + $scope.eventList[key].key + '/participants',
        $scope.eventList[key].participants
      );

      // Update button.
      $scope.allParticipantIsDisableds[idx]['isDisabled'] = false;
    };

    //might need to move into
    $scope.areWaiversUnsigned = function(person_detail, event_key) {
      var checker_obj = {};
      if (person_detail['witness']) {
        //perform date substraction to see if witness waiver is still valid
        //first time date was saved
        var saved_date = new Date(person_detail['witness']['date_signed']);

        //date range from today's date
        var d1 = new Date(Date.now());
        var d2 = new Date(d1.getFullYear() - 1, d1.getMonth(), d1.getDate());
        if (saved_date < d2) {
          //the witness waiver has expired
          checker_obj['witness'] = true;
        } else {
          //witness waiver hasn't expired
          checker_obj['witness'] = false;
        }
      } else {
        //witness never signed a waiver
        checker_obj['witness'] = true;
      }
      if (
        person_detail['events'] &&
        person_detail['events'].hasOwnProperty(event_key)
      ) {
        //no signing needed
        checker_obj['event'] = false;
      } else {
        //needs signing
        checker_obj['event'] = true;
      }
      return checker_obj;
    };

    /*waiver object:
              waiver{
                date_signed

              }
            */
    // Api.events.query().$promise.then(
    // 	function (response) { // on success
    // 		$scope.eventList = response;
    // 		if (response.length === 0) {
    // 			swal({
    // 				text: "No events exist.",
    // 				type: 'warning',
    // 				timer: 2500
    // 			});
    // 		}
    //
    // 	},
    // 	function (response) { // on error
    // 		swal({
    // 			text: "Connection failed. Could not " + response.config.method + " from " + response.config.url,
    // 			type: 'warning',
    // 			timer: 2500
    // 		});
    // 	});
  });
