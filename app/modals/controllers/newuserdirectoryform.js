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
  .controller('NewUserDirectoryFormCtrl', function(
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance,
    howLogService,
    userService
  ) {
    'use strict';

    $scope.initialize = function() {
      // calendar options
      $scope.popup = {
        opened: false,
      };

      $scope.format = 'MM/dd/yyyy';

      $scope.datePattern =
        '([0][1-9]|[1][0-2])[- /.]([0][1-9]|[1-2][0-9]|[3][0-1])[- /.](19|20)dd';

      $scope.chapters = [];

      $scope.regions = $rootScope.siteData.regions;

      $scope.states = $rootScope.siteData.states;

      $scope.branches = ['N/A', 'Firefighter', 'Police', 'EMS'];

      // empty submit object
      $scope.newUserDirectory = {
        gender: 'N/A',
        branch: 'N/A',
        years: 0,
        service_type: false,
        volunteer: false,
      };

      $scope.dateOptions = {
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(1900, 5, 22),
        showWeeks: false,
        startingDay: 1,
      };

      $('#phonenum').mask('(999)999-9999');
      $('#sanicDOB').mask('99/99/9999');
      $('#Zip').mask('99999');
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
      var chapterList = _.filter($rootScope.siteData.regionsChapters, function(
        n
      ) {
        return n.value === regionName;
      });
      $scope.chapters = chapterList[0].chapters;
    };

    $scope.ZipUpdate = function() {
      var result = commonServices.addressLookup(
        $scope.newUserDirectory.address.zip,
        function(callbackResult) {
          if (callbackResult.success == true) {
            $scope.locationUpdate(callbackResult.results);
          }
        }
      );
    };

    $scope.locationUpdate = function(location) {
      var ctrl = this;
      commonServices.zipCompare(location).then(function(result) {
        $scope.newUserDirectory.region = result[1];
        ctrl.regionUpdate(); //set option to chage
        var chapter = _.filter($scope.chapters, function(n) {
          return n.value === result[0];
        });
        $scope.newUserDirectory.chapter = chapter[0];
      });
    };

    $scope.postUser = function(form) {
      if (form.$invalid) {
        swal({
          text:
            'The form has required fields that are missing data or formatted improperly.',
          type: 'error',
          customClass: 'modal-border',
        });
      } else {
        if (typeof $scope.newUserDirectory.address.line2 === 'undefined') {
          $scope.newUserDirectory.address.line2 = '';
        }

        var packet = {
          address: {
            city: $scope.newUserDirectory.address.city,
            line1: $scope.newUserDirectory.address.line1,
            line2: $scope.newUserDirectory.address.line2
              ? $scope.newUserDirectory.address.line2
              : 'none',
            state: $scope.newUserDirectory.address.state.name,
            zip: $scope.newUserDirectory.address.zip,
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
          password: $scope.newUserDirectory.password,
        };

        var results = commonServices.register(packet);

        $q.all([results]).then(function(data) {
          if (data[0]) {
            swal({
              title: 'Email Verification Needed',
              text:
                'Account creation was succesful, to proceed to the Heroes On the Water Website please check your email (' +
                packet.email +
                ') and follow the email verification steps.',
              type: 'success',
            }).then(function() {
              if ($scope.newUserDirectory.volunteer) {
                var rcr_packet = {
                  uid: userService.getId(),
                  name: userService.getUserName(),
                  email: userService.getUserData().email,
                  current_role: userService.getRole(),
                  request_role: 'volunteer',
                  user_comment: 'none',
                  admin_comment: '',
                  request_status: 'pending',
                  request_created: Date.now(),
                  request_updated: Date.now(),
                  request_closed: '',
                };
                commonServices.pushData('/roleChangeRequests/', rcr_packet);
                swal({
                  text:
                    'Request to be Volunteer has been submitted! You can view the status of your request on your profile page.',
                  type: 'success',
                });
              }
            });

            //howLogService.logPrimaryChapterChange(packet.name.first + ' ' + packet.name.last, false, false, packet.Chapter);
            $uibModalInstance.close();
            window.location.replace('#/login');
          } else {
            // Do something here when sign in unsuccessful....
            swal({
              text: 'Error submitting data. Please try again',
              type: 'error',
              timer: 2500,
            });
          }
        });
      }
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
