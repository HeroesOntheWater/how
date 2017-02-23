/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of management console - events
 */
angular.module('ohanaApp')
    .controller('PublicEventsCtrl', function($q, commonServices, $scope, $uibModal, Api, selectValues, userService) {
        'use strict';
        $scope.newQuery = {};
        $scope.userService = userService;
        //var allEvents = [];



        var loadAll = function() {
            var getEvents = commonServices.getPublicEvents();
            // allEvents = [];
            $q.all([getEvents]).then(function(data) {
                if (data[0]) {
                    // _.each(data[0], function(event) {
                    //     allEvents.push(event);
                    // });
                    console.log(data[0])
                    $scope.eventList = data[0];
                } else {
                    console.log('Failed to get Events...');
                }
            });
        };

        loadAll();

        $scope.search = function() {
            if ($scope.eventList.length > 0) {
                $scope.empty = false;

                if ($scope.newQuery.search == '*' || !($scope.newQuery.search)) {
                    loadAll();
                } else {
                    var eventsFound = [];
                    _.each($scope.eventList, function(event) {
                        _.each(event, function(attribute) {
                            if (angular.isString(attribute) && angular.isString($scope.newQuery.search)) {
                                if (_.includes(attribute.toLowerCase(), $scope.newQuery.search.toLowerCase())) {
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
                        $scope.noEventsFound = "No results for " + $scope.newQuery.search + " found.";
                    }
                    $scope.eventList = eventsFound;
                }
            }

        };


        $scope.showDescription = function(index) {
            $scope.currentEvent = $scope.eventList[index];
            var modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: '/parts/public.events.description.html',
                controller: 'PublicEventsDescriptionCtrl'
            });

        };

        $scope.showDescription = function(index) {
            $scope.selected = $scope.eventList[index];
            console.log('Index is: ' + index);
            var getEvents = commonServices.getEvent($scope.selected);

            $q.all([getEvents]).then(function(data) {
                if (data[0]) {
                    _.each(data[0], function(event) {
                        if ($scope.selected.email === event.email) {
                            console.log('Event: ' + event.name);
                            $scope.selected = event;
                        }
                    });
                } else {
                    $scope.selected = null;
                }

            });
            if ($scope.selected != null) {
                var modalInstance = $uibModal.open({
                    scope: $scope,
                    templateUrl: '/parts/public.events.description.html',
                    controller: 'PublicEventsDescriptionCtrl'
                });

            }
        };

        $scope.addVolunteer = function(key) {
            //email = email.trim();
            var email = $scope.userService.getUserData()["email"];
            //check to see if the volunteer is a user at all. 
            commonServices.getUserByEmail(email)
                .then(function(data) {
                    if (data) {
                        var temp_key;
                        _.each(data, function(val, idx) {
                            temp_key = idx;
                            data[idx]["key"] = idx;
                        });

                        commonServices.getData('userRoles/' + temp_key)
                            .then(function(role) {
                                if (role["role"] !== "Participant") {
                                    //check to see if the volunteer exists per this event
                                    commonServices.getUserByEmailAtPath(email, '/events/' + key + '/volunteers')
                                        .then(function(vol) {
                                            console.log(vol);
                                            if (!vol) {
                                                commonServices.pushData('/events/' + key + '/volunteers', data[temp_key]);
                                            } else {
                                                swal(
                                                    'Oops...',
                                                    "That volunteer has already been added",
                                                    'error'
                                                );
                                            }

                                        })
                                } else {
                                    swal(
                                        'Oops...',
                                        "User not authorized to be added as a volunteer.",
                                        'error'
                                    );
                                }

                            })

                    } else {
                        swal(
                            'Oops...',
                            "That user doesn\'t exists",
                            'error'
                        );
                    }

                }, function(err) {
                    swal(
                        'Oops...',
                        "Unknown Error",
                        'error'
                    );
                });


        }
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
