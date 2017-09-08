/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:EventdetailvolunteersCtrl
 * @description
 * # EventdetailvolunteersCtrl
 * Controller of management console - event volunteers
 */

angular
  .module('ohanaApp')
  .controller('EventdetailvolunteersCtrl', function(
    $scope,
    $uibModal,
    Api,
    dataGridUtil
  ) {
    'use strict';

    $scope.selectedParticipants = [];

    $scope.add = function() {
      var modalInstance = $uibModal.open({
        scope: $scope,
        templateUrl: '/parts/addParticipantsToEvent.html',
        controller: 'EventaddvolunteersCtrl',
      });
    }; // end $scope.add
    $scope.removed = function(item) {
      var itemNum = $scope.selectedParticipants.indexOf(item);
      $scope.selectedParticipants.splice(itemNum, 1);
    };

    $scope.onSelectCallback = function(item) {
      $scope.selectedParticipants.push(item);
    };

    Api.member.query().$promise.then(
      function(response) {
        console.log(response);
        $scope.participantList = response.map(function(member) {
          var memberSimplified = {};
          memberSimplified.name = member.first_name + ' ' + member.last_name;
          memberSimplified.email = member.email;
          memberSimplified.id = member.id;
          return memberSimplified;
        });
      },
      function(response) {
        console.log(response);
      }
    );

    $scope.addParticipants = function() {
      var newParticipantPromises = [];
      if ($scope.selectedParticipants.length == 0) {
        swal('', 'No records selected!', 'warning');
      }

      $scope.selectedParticipants.forEach(function(member, index, array) {
        if (array.length === 0) {
          return;
        }
        newParticipantPromises.push(
          Api.addMemberToEvent.save({
            event_id: $scope.howEvent.currentEvent.id,
            member_id: member.id,
          }).$promise
        );
      });
      $q.all(newParticipantPromises).then(function() {
        $scope.refresh();
      });
    }; // end $scope.addParticipants

    $scope.refresh = function() {
      $scope.update();
    };

    $scope.buildTable = function(results) {
      var dataSet = dataGridUtil.buildEventPeopleTableData(results);
      $scope.currId = ''; // holds va	// if (!modalInstance) {
      // 	$scope.update();
      // }lue of the current row's member Id for CRUD ops

      angular.element(document).ready(function() {
        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#eventVolunteersTable'))) {
          $scope.eventVolunteersTable.destroy();
        }

        $scope.eventVolunteersTable = $('#eventVolunteersTable').DataTable({
          data: dataSet,
          columns: [
            {},
            {
              title: 'ID',
              data: 'DT_RowId',
            },
            {
              title: 'First Name',
              data: 'first_name',
            },
            {
              title: 'Last Name',
              data: 'last_name',
            },
            {
              title: 'Email',
              data: 'email',
              orderable: false,
            },
          ],
          columnDefs: [
            {
              targets: 1,
              visible: false,
            },
            {
              targets: 0,
              width: '15px',
              searchable: false,
              orderable: false,
              className: 'dt-body-center',
              render: function(data) {
                return (
                  '<input type="checkbox" id="eventVolunteersTable-select" value="' +
                  $('<div/>')
                    .text(data)
                    .html() +
                  '">'
                );
              },
            },
            {
              targets: 2,
              width: '200px',
            },
            {
              targets: 3,
              width: '200px',
            },
          ],
          order: [[3, 'asc']],
          headerCallback: function(thead) {
            $(thead)
              .find('th')
              .eq(0)
              .html(
                '<input type="checkbox" id="eventVolunteersTable-select-all">'
              );
          },
          rowCallback: function(row, data, index) {
            // empty
          },
          drawCallback: function(settings) {
            // set currentId to user being edited
            $('#eventVolunteersTable').on('click', 'tr', function() {
              $scope.currId = $scope.eventVolunteersTable.row(this).id();
            });
          },
        }); //.columns.adjust().draw();

        // Handle click on "Select all" control
        $('#eventVolunteersTable-select-all').on('click', function() {
          // Get all rows with search applied
          var rows = $scope.eventVolunteersTable
            .rows({
              search: 'applied',
            })
            .nodes();
          // Check/uncheck checkboxes for all rows in the table
          $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });

        // Handle click on checkbox to set state of "Select all" control
        $(
          '#eventVolunteersTable tbody'
        ).on('change', 'input[type="checkbox"]', function() {
          // If checkbox is not checked
          if (!this.checked) {
            var el = $('#eventVolunteersTable-select-all').get(0);
            // If "Select all" control is checked and has 'indeterminate' property
            if (el && el.checked && 'indeterminate' in el) {
              // Set visual state of "Select all" control
              // as 'indeterminate'
              el.indeterminate = true;
            }
          }
        });
      }); // end document ready
    }; // end $scope.buildTable

    $scope.update = function() {
      Api.getMembersByEvent
        .query({
          event_id: $scope.howEvent.currentEvent.id,
        })
        .$promise.then(
          function(data) {
            $scope.buildTable(data);
            $scope.dataStack = data;
          },
          function(data) {
            $scope.buildTable(data);
            $scope.dataStack = data;
            swal({
              text:
                'Connection failed. Could not ' +
                data.config.method +
                ' from ' +
                data.config.url,
              type: 'warning',
              timer: 2500,
            });
          }
        );
    }; // end $scope.update

    $scope.remove = function() {
      var j, k;
      var rows = $scope.eventVolunteersTable
          .rows({
            search: 'applied',
          })
          .nodes(),
        checkedRows = [];
      for (j = 0; j < rows.length; j++) {
        if ($('input[type="checkbox"]', rows[j]).prop('checked')) {
          checkedRows.push($scope.dataStack[j]);
        }
      }

      if (checkedRows.length === 0) {
        swal('', 'No records selected!', 'warning');
      } else {
        swal({
          title: 'Are you sure?',
          text: 'Get ready to kiss it goodbye!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
        }).then(function() {
          for (k = 0; k < checkedRows.length; k++) {
            console.log(
              Api.dropMemberFromEvent.remove({
                event_id: $scope.howEvent.currentEvent.id,
                member_id: checkedRows[k].id,
              })
            );
          }
          swal('Deleted!', 'Your file has been deleted.', 'success');

          $('#eventVolunteersTable-select-all').prop('checked', false);
          $('input[type="checkbox"]', rows).prop('checked', false);
          $scope.update();
        });
      } // end else
    }; // end $scope.remove
  });
