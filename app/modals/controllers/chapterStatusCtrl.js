/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ChapterStatusCtrl
 * @description
 * # ChapterStatusCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('ChapterStatusCtrl', function(
    $q,
    commonServices,
    userService,
    $scope,
    $rootScope,
    $uibModalInstance
  ) {
    'use strict';

    $scope.initialize = function() {
      $scope.logLevel = false;
      $scope.selectedRegion = false;
      $scope.selectedChapter = false;
      $scope.selectedOption = false;
      $scope.chapters = [];
      $scope.regions = $rootScope.siteData.regionsChapters;
      $scope.logType = [];
      $scope.currentLog = [];
      if (userService.getRole() === 'Chapter Lead') {
        $scope.levelChanged('Chapter');
        $scope.selectedChapter = {
          text: userService.getChapter(),
        };
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

    $scope.chapterChanged = function() {
      $scope.selectedOption = false;
    };

    $scope.levelChanged = function(level) {
      $scope.currentLog = [];
      if (level === 'National') {
        $scope.logType = [
          {
            text: 'All Chapter Changes',
          },
        ];
      } else {
        $scope.logType = [
          {
            text: 'Primary Member Changes',
          },
          {
            text: 'Secondary Member Changes',
          },
        ];
      }
    };

    $scope.selectedLogOption = function(selected) {
      var logData;
      switch (selected.text) {
        case 'All Chapter Changes':
          logData = commonServices.getData('/logs/nationalLogs/memberTraffic');
          $q.all([logData]).then(function(data) {
            $scope.formatAllLogs(data[0]);
          });
          break;
        case 'Primary Member Changes':
          logData = commonServices.getData(
            '/logs/chapterLogs/memberTraffic/primaryChapter/' +
              $scope.selectedChapter.text
          );
          $q.all([logData]).then(function(data) {
            $scope.formatPrimaryMemberLogs(data[0]);
          });
          break;
        case 'Secondary Member Changes':
          logData = commonServices.getData(
            '/logs/chapterLogs/memberTraffic/secondaryChapter/' +
              $scope.selectedChapter.text
          );
          $q.all([logData]).then(function(data) {
            $scope.formatSecondaryMemberLogs(data[0]);
          });
          break;
        default:
          console.log('No Log Option...');
      }
    };

    $scope.formatAllLogs = function(data) {
      var newLog = [];
      var msg, packet;
      _.each(data, function(n) {
        packet = {
          msg: '',
          ts: n.timeStamp,
        };
        if (n.type === 'primary') {
          packet.msg += n.userName + ' ';
          if (n.changedBy) {
            packet.msg +=
              'Primary Chapter was switched by ' + n.changedBy + ' from ';
            packet.msg += n.oldChapter + ' to ' + n.newChapter;
          } else {
            if (n.oldChapter) {
              packet.msg +=
                'switched Primary Chapter from ' +
                n.oldChapter +
                ' to ' +
                n.newChapter;
            } else {
              packet.msg +=
                'is a newly registered user, and has joined ' + n.newChapter;
            }
          }
        } else if (n.type === 'secondary') {
          packet.msg += n.userName + ' ';
          if (n.changedBy) {
            packet.msg +=
              'Secondary Chapter(s) was modified by ' + n.changedBy + ': ';
          } else {
            packet.msg += 'Secondary Chapter(s) was modified : ';
          }

          if (n.oldChapters) {
            packet.msg += 'Removed: ';
            _.each(n.oldChapters, function(c) {
              packet.msg += c + ', ';
            });
          }

          if (n.newChapters) {
            packet.msg += 'Added: ';
            _.each(n.newChapters, function(c) {
              packet.msg += c + ', ';
            });
          }
        } else {
          console.log('Invalid Type.....');
        }

        newLog.push(packet);
      });
      $scope.currentLog = newLog.reverse();
    };

    $scope.formatPrimaryMemberLogs = function(data) {
      var newLog = [];
      var msg, packet;
      _.each(data, function(n) {
        packet = {
          msg: '',
          ts: n.timeStamp,
        };

        if (n.status === 'added') {
          if (n.changedBy) {
            packet.msg +=
              n.userName +
              ' has been ADDED to ' +
              $scope.selectedChapter.text +
              ' by ' +
              n.changedBy +
              '.';
          } else {
            packet.msg +=
              n.userName + '  has JOINED ' + $scope.selectedChapter.text + '.';
          }
        } else {
          if (n.changedBy) {
            packet.msg +=
              n.userName +
              ' has been REMOVED from ' +
              $scope.selectedChapter.text +
              ' by ' +
              n.changedBy +
              '.';
          } else {
            packet.msg +=
              n.userName + '  has LEFT ' + $scope.selectedChapter.text + '.';
          }
        }

        newLog.push(packet);
      });
      $scope.currentLog = newLog.reverse();
    };

    $scope.formatSecondaryMemberLogs = function(data) {
      var newLog = [];
      var msg, packet;
      _.each(data, function(n) {
        packet = {
          msg: '',
          ts: n.timeStamp,
        };

        if (n.status === 'added') {
          if (n.changedBy) {
            packet.msg +=
              n.userName +
              ' has been ADDED to ' +
              $scope.selectedChapter.text +
              ' as a secondary member by ' +
              n.changedBy +
              '.';
          } else {
            packet.msg +=
              n.userName +
              '  has JOINED ' +
              $scope.selectedChapter.text +
              ' as a secondary member.';
          }
        } else {
          if (n.changedBy) {
            packet.msg +=
              n.userName +
              ', as a secondary member, has been REMOVED from ' +
              $scope.selectedChapter.text +
              ' by ' +
              n.changedBy +
              '.';
          } else {
            packet.msg +=
              n.userName +
              ', as a scondary member,  has LEFT ' +
              $scope.selectedChapter.text +
              '.';
          }
        }

        newLog.push(packet);
      });
      $scope.currentLog = newLog.reverse();
    };
  });
