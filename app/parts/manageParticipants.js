/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ManageParticipantsCtrl
 * @description
 * # ManageParticipantsCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('ManageParticipantsCtrl', function(
    eventData,
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance,
    $uibModal,
    dataGridUtil
  ) {
    'use strict';

    $scope.eventData = eventData;

    // Get most recent data on participants tied to this event.
    $scope.initialize = function() {
      $scope.tableEmpty = false;

      if ($scope.eventData.type === 'participants') {
        $scope.getCurrentParticipantsData($scope.eventData.event.participants);
      } else {
        $scope.getCurrentParticipantsData($scope.eventData.event.volunteers);
      }
    };

    // Opens edit participants modal
    $scope.addParticipantToEvent = function() {
      $uibModalInstance.dismiss('cancel');
      $uibModal.open({
        templateUrl: '/parts/addParticipantsToEvent.html',
        controller: 'AddParticipantToEvent',
        resolve: {
          eventData: function() {
            return $scope.eventData;
          },
        },
      });
    };

    // Daniel Arroyo Add waiver module here :)
    $scope.participantSignWaiver = function() {
      $uibModalInstance.dismiss('cancel');
      $uibModal.open({
        templateUrl: '/parts/sign_event_waiver.html',
        controller: 'SignEventWaiver',
        resolve: {
          eventData: function() {
            return $scope.eventData;
          },
        },
      });
    };

    // Daniel Arroyo Add waiver module here :)
    $scope.participantSignMediaWaiver = function() {
      $uibModalInstance.dismiss('cancel');
      $uibModal.open({
        templateUrl: '/parts/sign_media_waiver.html',
        controller: 'SignMediaWaiver',
        resolve: {
          eventData: function() {
            return $scope.eventData;
          }
        },
      });
    };

    $scope.rollCall = function() {
      $uibModalInstance.dismiss('cancel');
      $uibModal.open({
        templateUrl: '/parts/eventRollCall.html',
        controller: 'EventRollCall',
        resolve: {
          eventData: function() {
            return $scope.eventData;
          },
        },
      });
    };

    $scope.getCurrentParticipantsData = function(participantsList) {
      // Initialze Variables.
      var promiseArray = [];

      if (_.isUndefined(participantsList) || _.isEmpty(participantsList)) {
        // Display Error.
        $scope.tableEmpty = true;
      } else {
        // Get id for each participant, and create promise.
        var guestList = [];
        _.each(participantsList, function(participant) {
          if (participant.guest) {
            guestList.push(participant);
          } else {
            promiseArray.push(
              commonServices.getData('userData/' + participant.key)
            );
          }
        });

        // Run promise array and handle returned data.
        $q.all(promiseArray).then(function(data) {
          data = data.concat(guestList);
          $scope.buildTable(data);
        });
      }
    };

    // Close Manage Participants Modal, and refresh events page.
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
      if ($scope.eventData.step === 'public') {
        var modalInstance = $uibModal.open({
          templateUrl: '/parts/public.events.description.html',
          controller: 'PublicEventsDescriptionCtrl',
          resolve: {
            event: function() {
              return $scope.eventData.event;
            },
          },
        });
      } else {
        $rootScope.$broadcast('updateEventPage');
      }
    };

    // Builds table to be seen within modal.
    $scope.buildTable = function(results) {
      var dataSet = dataGridUtil.buildParticipantsTable(results);
      $scope.currId = '';

      angular.element(document).ready(function() {
        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };

        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#participantsTable'))) {
          $scope.participantsTable.destroy();
        }

        $scope.membersTable = $('#participantsTable').DataTable({
          data: dataSet,
          iDisplayLength: 5,
          aLengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, 'All']],
          columns: [
            {},
            {
              title: 'Name',
              data: 'name',
            },
            {
              title: 'Email',
              data: 'email',
            },
            {
              title: 'Phone',
              data: 'phone',
            },
            {
              title: 'Type',
              data: 'type',
            },
            {
              title: 'Waiver',
              data: 'waiver',
            },
          ],
          responsive: {
            details: {
              type: 'column',
            },
          },
          columnDefs: [
            {
              targets: 0,
              searchable: false,
              orderable: false,
              className: 'dt-body-center control',
              render: function() {
                return '<div id="participants-row-data" style="width: 20px;">';
              },
            },
          ],
          order: [[2, 'asc']],
          headerCallback: _.noop,
          rowCallback: function(row, data, index) {
            $(row)
              .find('div#participants-row-data')
              .attr('data-key', data.key);
            $(row)
              .find('div#participants-row-data')
              .attr('data-row-index', index);
            var waiverStatus = $(row).find('td')[5];
            if ($(waiverStatus).text() === 'Complete') {
              $(waiverStatus).css('color', 'green');
            } else {
              $(waiverStatus).css('color', 'red');
            }
            return row;
          },
          drawCallback: function(settings) {
            // Reset button and clear selected
            $('tbody')
              .find('tr')
              .css('background-color', '');
            $scope.swStatus = true;
            $scope.currId = '';

            // Get the currently selected: state, Region, and chapterId.
            $('#participantsTable').off('click', 'tbody tr[role="row"]');
            $('#participantsTable').on(
              'click',
              'tbody tr[role="row"]',
              function() {
                // Set currently selected account.
                $scope.currId = $(this)
                  .find('div#participants-row-data')
                  .data('key');
                $('tbody')
                  .find('tr')
                  .css('background-color', '');
                $(this).css('background-color', '#FFFFC4');
                $('#signWaiver').removeClass('disabled');
                $('#signMediaWaiver').removeClass('disabled');
              }
            );

            // Clear selected value when user paginates
            $('#participantsTable_paginate').off('click');
            $('#participantsTable_paginate').on('click', function() {
              $('tbody')
                .find('tr')
                .css('background-color', '');
              $('#signWaiver').addClass('disabled');
            });
          },
        });
      });
    };
  });
