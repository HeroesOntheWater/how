/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ChangeChapterCtrl
 * @description
 * # ChangeChapterCtrl
 * Controller of the ohanaApp
 */
angular.module('ohanaApp').controller('ChangeChapterCtrl', [
  'selectedUID',
  '$scope',
  '$rootScope',
  '$q',
  'commonServices',
  'userService',
  '$uibModalInstance',
  'howLogService',
  function(
    selectedUID,
    $scope,
    $rootScope,
    $q,
    commonServices,
    userService,
    $uibModalInstance,
    howLogService
  ) {
    'use strict';

    $scope.chapters = [];
    $scope.regions = $rootScope.siteData.regionsChapters;

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.regionUpdate = function(selectedRegion) {
      // Update chapter drop down based on selected region.
      var chapterList = _.filter($rootScope.siteData.regionsChapters, function(
        n
      ) {
        return n.value === selectedRegion.value;
      });
      $scope.chapters = chapterList[0].chapters;
    };

    $scope.updateRegionChapter = function(region, chapter) {
      if (selectedUID) {
        var getSelectedUser = commonServices.getData(
          '/userData/' + selectedUID
        );
        $q.all([getSelectedUser]).then(function(data) {
          swal({
            title: 'Are you sure?',
            text:
              'Changing ' +
              data[0].name.first +
              ' ' +
              data[0].name.last +
              ' chapter will revert their role to Participant...',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, please continue!',
          }).then(function() {
            // Logg changes.
            // howLogService.logPrimaryChapterChange(data[0].name.first + ' ' + data[0].name.last, userService.getUserName(),
            //     data[0].Chapter, chapter.text);
            // howLogService.logUserAddedToChapter(data[0].name.first + ' ' + data[0].name.last, userService.getUserName(), chapter.text);
            // howLogService.logUserRemovedFromChapter(data[0].name.first + ' ' + data[0].name.last, userService.getUserName(), data[0].Chapter);

            delete chapter.$$hashKey;

            // Get new values and update DB.
            commonServices.updateData(
              '/userData/' + selectedUID + '/Region',
              region.value
            );
            commonServices.updateData(
              '/userData/' + selectedUID + '/Chapter',
              chapter
            );
            commonServices.updateData(
              '/userRoles/' + selectedUID + '/role',
              'Participant'
            );

            // Close modal with success message.
            $uibModalInstance.dismiss('cancel');
            $rootScope.$broadcast('modalClosing');
            swal('Success', 'Region/Chapter updated successfully!', 'success');
          });
        });
      } else {
        swal({
          title: 'Are you sure?',
          text:
            'Your role will be changed to Participant if you change your PRIMARY CHAPTER',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, please continue!',
        }).then(function() {
          // Get new values.
          var userId = userService.getId();
          var userData = userService.getUserData();
          var currentChapter = userService.getChapter();
          var currentUserName = userService.getUserName();
          delete chapter.$$hashKey;

          // Logg changes.
          // howLogService.logPrimaryChapterChange(currentUserName, false,
          //     currentChapter, chapter.value);
          // howLogService.logUserAddedToChapter(currentUserName, false, chapter.text);
          // howLogService.logUserRemovedFromChapter(currentUserName, false, currentChapter);

          // update DB.
          commonServices.updateData(
            '/userData/' + userId + '/Region',
            region.value
          );
          commonServices.updateData(
            '/userData/' + userId + '/Chapter',
            chapter
          );
          commonServices.updateData(
            '/userRoles/' + userId + '/role',
            'Participant'
          );

          // Update global variables.
          userData.Region = region.value;
          userData.Chapter = chapter;
          userService.setUserData(userData);
          userService.setChapter(chapter);
          userService.setRole('Participant');

          // Close modal with success message.
          $uibModalInstance.dismiss('cancel');
          $rootScope.$broadcast('updateProfile', true);
          swal('Success', 'Region/Chapter updated successfully!', 'success');
        });
      }
    };
  },
]);
