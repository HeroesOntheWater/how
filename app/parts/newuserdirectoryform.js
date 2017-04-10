/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:NewuserdirectoryformCtrl
 * @description
 * # NewuserdirectoryformCtrl
 * Controller of the ohanaApp
 */
angular.module('ohanaApp')
    .controller('NewUserDirectoryFormCtrl', function($rootScope, $q, commonServices, $scope, $uibModalInstance, howLogService) {
        'use strict';

        $scope.initialize = function() {
            // calendar options
            $scope.popup = {
                opened: false
            };

            $scope.format = 'MM/dd/yyyy';

            $scope.datePattern = '([0][1-9]|[1][0-2])[- /.]([0][1-9]|[1-2][0-9]|[3][0-1])[- /.](19|20)\d\d';

            $scope.chapters = [];

            $scope.regions = $rootScope.siteData.regions;

            $scope.states = $rootScope.siteData.states;

            $scope.branches = ['N/A', 'Firefighter', 'Police', 'EMS'];

            // empty submit object
            $scope.newUserDirectory = {
                gender: 'N/A',
                branches: 'N/A',
                years: 0,
                service_type: false
            };

            $scope.dateOptions = {
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(1900, 5, 22),
                showWeeks: false,
                startingDay: 1
            };
        };

        $scope.setDefault = function() {
            $scope.newUserDirectory.branch = 'N/A';
            $scope.newUserDirectory.years = 0;
        };

        $scope.open = function() {
            $scope.popup.opened = true;
        };

        $scope.regionUpdate = function() {
            var regionName = $scope.newUserDirectory.region.text;
            var path = '/Regions/' + regionName + '/';
            var getChapters = commonServices.getData(path);

            $q.all([getChapters]).then(function(data) {
                var chapterNames = [];
                if (data[0]) {
                    _.each(data[0], function(state) {
                        _.each(state, function(chapters) {
                            chapterNames.push(chapters.name);
                        });
                    });
                    $scope.chapters = chapterNames;
                } else {
                    console.log('Failed to get Chapters...');
                }
            });
        };

        $scope.ZipUpdate = function() {
            var result = commonServices.addressLookup($scope.newUserDirectory.address.zip, function(callbackResult) {
                if (callbackResult.success == true) {
                    $scope.locationUpdate(callbackResult.results);
                }
            });
        };

        $scope.locationUpdate = function(location) {
            var ctrl = this;
            commonServices.zipCompare(location).then(function(result) {
                $scope.newUserDirectory.region = result[1];
                ctrl.regionUpdate();
                $scope.newUserDirectory.chapter = result[0];
            });

        };

        $scope.postUser = function(form) {
            console.log(form);

            if (form.$invalid) {
                swal({
                    text: "Please check the form for any fields that are highlighted in red",
                    type: 'error'
                });
            } else {
                if (typeof $scope.newUserDirectory.address.line2 === 'undefined') {
                    $scope.newUserDirectory.address.line2 = '';
                }

                var packet = {
                    address: {
                        city: $scope.newUserDirectory.address.city,
                        line1: $scope.newUserDirectory.address.line1,
                        line2: $scope.newUserDirectory.address.line2,
                        state: $scope.newUserDirectory.address.state.name,
                        zip: $scope.newUserDirectory.address.zip
                    },
                    name: $scope.newUserDirectory.name,
                    branch: $scope.newUserDirectory.branch,
                    email: $scope.newUserDirectory.email,
                    gender: $scope.newUserDirectory.gender,
                    DOB: $scope.newUserDirectory.DOB.getTime(),
                    phone: $scope.newUserDirectory.phone,
                    years: $scope.newUserDirectory.years,
                    Region: $scope.newUserDirectory.region.text,
                    Chapter: $scope.newUserDirectory.chapter,
                    password: $scope.newUserDirectory.password
                };

                var results = commonServices.register(packet);

                $q.all([results]).then(function(data) {
                    console.log(data[0]);
                    if (data[0]) {
                        // If sign in was successful, send user to events page
                        swal({
                            text: "User added!",
                            type: 'success',
                            timer: 2500
                        });
                        howLogService.logPrimaryChapterChange(packet.name.first + ' ' + packet.name.last, false, false, packet.Chapter);
                        $uibModalInstance.close();
                        window.location.replace('#/home');
                    } else {
                        // Do something here when sign in unsuccessful....
                        swal({
                            text: "Error submitting data. Please try again",
                            type: 'error',
                            timer: 2500
                        });
                    }
                });
            }

        };

        $scope.validateDOB = function() {
            console.log($scope.newUserDirectory.DOB);
        };

        // pattern="([0][1-9]|[1][0-2])[- /.]([0][1-9]|[1-2][0-9]|[3][0-1])[- /.](19|20)\d\d"

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        angular.element(document).ready(function() {
            $('#phonenum').mask('(999)999-9999');
            $('#sanicDOB').mask('99/99/9999');
            $('#Zip').mask('99999');
        });
    });
