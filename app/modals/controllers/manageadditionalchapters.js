/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ManageAdditionalChapters
 * @description
 * # ManageAdditionalChapters
 * Controller of the ohanaApp
 */
angular.module('ohanaApp').controller('ManageAdditionalChapters', [
  'selectedUID',
  '$q',
  'commonServices',
  'userService',
  '$scope',
  '$rootScope',
  '$uibModalInstance',
  'howLogService',
  function(
    selectedUID,
    $q,
    commonServices,
    userService,
    $scope,
    $rootScope,
    $uibModalInstance,
    howLogService
  ) {
    'use strict';

    $scope.initialize = function() {
      $scope.submitFlag = false;
      $scope.userChapters = [];
      $scope.chapters = [];
      $scope.regions = $rootScope.siteData.regionsChapters;
      $scope.chaptersRemoved = [];
      $scope.chaptersAdded = [];

      if (selectedUID) {
        var selectedUserData = commonServices.getData(
          '/userData/' + selectedUID
        );
        $q.all([selectedUserData]).then(function(data) {
          $scope.userData = data[0];
          _.each($scope.userData.Chapters, function(n) {
            $scope.userChapters.push(n);
          });
        });
      } else {
        $scope.userData = userService.getUserData();
        _.each($scope.userData.Chapters, function(n) {
          $scope.userChapters.push(n);
        });
      }
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
      $rootScope.$broadcast('modalClosing');
    };

    $scope.regionUpdate = function(selectedRegion) {
      // Update chapter drop down based on selected region.
      _.each($scope.regions, function(region) {
        if (selectedRegion.value === region.value) {
          $scope.chapters = region.chapters;
        }
      });
    };

    $scope.addChapter = function() {
      var canUpdate = true;
      var chapterObj = {
        region: $scope.newRegion.value,
        chapter: $scope.newChapter,
      };

      _.each($scope.userChapters, function(n) {
        if (n.chapter.key === $scope.newChapter.key) {
          canUpdate = false;
        }
      });

      if (canUpdate) {
        $scope.userChapters.push(chapterObj);
        $scope.chaptersAdded.push(chapterObj.chapter);
        $scope.chaptersRemoved = _.filter($scope.chaptersRemoved, function(n) {
          return n !== chapterObj.chapter;
        });
        $scope.submitFlag = true;
      } else {
        swal(
          'error',
          $scope.newChapter.value +
            ' has already been added to secondary chapters...',
          'error'
        );
      }
    };

    $scope.updateChapters = function() {
      if (selectedUID) {
        var getSelectedUser = commonServices.getData(
          '/userData/' + selectedUID
        );
        var canContinue = true;
        $q.all([getSelectedUser]).then(function(data) {
          $scope.userChapters = _.each($scope.userChapters, function(n) {
            delete n.$$hashKey;
          });

          _.each($scope.userChapters, function(n) {
            if (n.chapter === data[0].Chapter) {
              canContinue = false;
              return;
            }
          });

          if (canContinue) {
            // Logg changes.
            // howLogService.logSecondaryChapterChange(data[0].name.first + ' ' + data[0].name.last, userService.getUserName(),
            //     $scope.chaptersRemoved, $scope.chaptersAdded);
            // howLogService.logUserAddedToSecondaryChapter(data[0].name.first + ' ' + data[0].name.last, userService.getUserName(), $scope.chaptersAdded);
            // howLogService.logUserRemovedFromSecondaryChapter(data[0].name.first + ' ' + data[0].name.last, userService.getUserName(), $scope.chaptersRemoved);

            $scope.userChapters = _.each($scope.userChapters, function(n) {
              delete n.$$hashKey;
              delete n.chapter.$$hashKey;
            });

            // Update global variables, and Database.
            commonServices.updateData(
              '/userData/' + selectedUID + '/Chapters/',
              $scope.userChapters
            );

            // Close modal with success message.
            $uibModalInstance.dismiss('cancel');
            $rootScope.$broadcast('modalClosing');
            swal('Success', 'Region/Chapter updated successfully!', 'success');
          } else {
            swal(
              'Error',
              'User already has ' +
                data[0].Chapter +
                ' as their PRIMARY CHAPTER, please remove before submitting changes...',
              'error'
            );
          }
        });
      } else {
        var userId = userService.getId();
        var userData = userService.getUserData();
        var currentChapter = userService.getChapter();
        var currentUserName = userService.getUserName();
        var canContinue = true;

        _.each($scope.userChapters, function(n) {
          if (n.chapter === userService.getChapter()) {
            canContinue = false;
            return;
          }
        });

        if (canContinue) {
          // Logg changes.
          // howLogService.logSecondaryChapterChange(currentUserName, false,
          //     $scope.chaptersRemoved, $scope.chaptersAdded);
          // howLogService.logUserAddedToSecondaryChapter(currentUserName, false, $scope.chaptersAdded);
          // howLogService.logUserRemovedFromSecondaryChapter(currentUserName, false, $scope.chaptersRemoved);

          $scope.userChapters = _.each($scope.userChapters, function(n) {
            delete n.$$hashKey;
            delete n.chapter.$$hashKey;
          });

          // Update global variables, and Database.
          commonServices.updateData(
            '/userData/' + userId + '/Chapters/',
            $scope.userChapters
          );
          userData.Chapters = $scope.userChapters;
          userService.setUserData(userData);

          // Close modal with success message.
          $uibModalInstance.dismiss('cancel');
          $rootScope.$broadcast('updateProfile', true);
          swal('Success', 'Region/Chapter updated successfully!', 'success');
        } else {
          swal(
            'Error',
            'User already has ' +
              userService.getChapter() +
              ' as their PRIMARY CHAPTER, please remove before submitting changes...',
            'error'
          );
        }
      }
    };

    $scope.removeChapter = function() {
      $scope.userChapters = _.filter($scope.userChapters, function(n) {
        return n.chapter !== $scope.currentChapter[0].chapter;
      });

      $scope.chaptersAdded = _.filter($scope.chaptersAdded, function(n) {
        return n !== $scope.currentChapter[0].chapter;
      });

      $scope.chaptersRemoved.push($scope.currentChapter[0].chapter);

      $scope.submitFlag = true;
    };
  },
]);
