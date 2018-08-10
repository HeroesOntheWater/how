/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:EventdetailequipmentCtrl
 * @description
 * # EventdetailequipmentCtrl
 * Controller of management console - event equipment
 */

angular
  .module('ohanaApp')
  .controller('EventdetailequipmentCtrl', function(
    $q,
    $scope,
    $uibModal,
    Api,
    dataGridUtil
  ) {
    'use strict';

    $scope.error = false;

    $scope.person = {
      selected: [],
    };

    $scope.disabled = undefined;

    $scope.selectedInventory = [];

    $scope.onSelectCallback = function(item) {
      $scope.selectedInventory.push(item);
    };

    $scope.add = function() {
      $scope.m = $uibModal.open({
        scope: $scope,
        templateUrl: '/modals/views/addInventoryToEvent.html',
        controller: 'EventaddinventoryCtrl',
      });
    }; // end $scope.add

    $scope.removed = function(item) {
      var itemNum = $scope.selectedInventory.indexOf(item);
      $scope.selectedInventory.splice(itemNum, 1);
    };

    Api.getChapterItems
      .query({
        chapter_id: $scope.howEvent.currentEvent.chapter.id,
      })
      .$promise.then(
        function(response) {
          $scope.selectedInventory = response.map(function(item) {
            var memberSimplified = {};
            memberSimplified.name = item.name;
            memberSimplified.category = item.category;
            memberSimplified.id = item.id;

            return memberSimplified;
          });
        },
        function(response) {
          console.log(response);
        }
      );

    $scope.addParticipants = function() {
      var newParticipantPromises = [];
      if ($scope.selectedInventory.length == 0) {
        swal('', 'No records selected!', 'warning');
      }

      $scope.selectedInventory.forEach(function(member, index, array) {
        if (array.length === 0) {
          return;
        }
        newParticipantPromises.push(
          Api.reserveItemToEvent.save({
            event_id: $scope.howEvent.currentEvent.id,
            item_id: member.id,
            date: $scope.howEvent.currentEvent.createdAt,
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
    /*	Displays the users for a given event
         *
         *
         */
    $scope.buildTable = function(results) {
      var dataSet = dataGridUtil.buildEventPeopleTableData(results);
      $scope.currId = ''; // holds value of the current row's member Id for CRUD ops

      angular.element(document).ready(function() {
        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#eventInventoryTable'))) {
          $scope.eventInventoryTable.destroy();
        }

        $scope.eventInventoryTable = $('#eventInventoryTable').DataTable({
          data: dataSet,
          columns: [
            {},
            {
              title: 'ID',
              data: 'DT_RowId',
            },
            {
              title: 'Item Name',
              data: 'name',
            },
            {
              title: 'Category',
              data: 'category',
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
                  '<input type="checkbox" id="eventInventoryTable-select" value="' +
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
                '<input type="checkbox" id="eventInventoryTable-select-all">'
              );
          },
          rowCallback: function(row, data, index) {
            // empty
          },
          drawCallback: function(settings) {
            // set currentId to user being edited
            $('#eventInventoryTable').on('click', 'tr', function() {
              $scope.currId = $scope.eventInventoryTable.row(this).id();
            });
          },
        }); //.columns.adjust().draw();

        // Handle click on "Select all" control
        $('#eventInventoryTable-select-all').on('click', function() {
          // Get all rows with search applied
          var rows = $scope.eventInventoryTable
            .rows({
              search: 'applied',
            })
            .nodes();
          // Check/uncheck checkboxes for all rows in the table
          $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });

        // Handle click on checkbox to set state of "Select all" control
        $('#eventInventoryTable tbody').on(
          'change',
          'input[type="checkbox"]',
          function() {
            // If checkbox is not checked
            if (!this.checked) {
              var el = $('#eventInventoryTable-select-all').get(0);
              // If "Select all" control is checked and has 'indeterminate' property
              if (el && el.checked && 'indeterminate' in el) {
                // Set visual state of "Select all" control
                // as 'indeterminate'
                el.indeterminate = true;
              }
            }
          }
        );
      }); // end document ready
    }; // end $scope.buildTable

    $scope.update = function() {
      Api.getEventItems
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
      var rows = $scope.eventInventoryTable
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
        //				var deletedParticipantPromises = [];
        //				if ($scope.selectedInventory.length === 0) {
        swal('', 'No records selected!', 'warning');
        //				}
        //				} else {
        //					$scope.selectedInventory.forEach(function (member, index, array) {
        //						if (array.length === 0) {
        //							return;
        //						}
        //						deletedParticipantPromises.push(Api.dropMemberFromEvent.remove({
        //							event_id: $scope.howEvent.currentEvent.id,
        //							member_id: member.id
        //						}).$promise);
        //					});
        //					$q.all(deletedParticipantPromises).then(function () {
        //						console.log("deleted");
        //						$scope.update();
        //					});
        //				}
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
          var deletedParticipantPromises = [];
          //					$scope.selectedInventory.forEach(function (member, index, array) {
          //						if (array.length === 0) {
          //							return;
          //						}
          //						deletedParticipantPromises.push(Api.dropMemberFromEvent.remove({
          //							event_id: $scope.howEvent.currentEvent.id,
          //							member_id: member.id
          //						}).$promise);
          //					});

          for (k = 0; k < checkedRows.length; k++) {
            deletedParticipantPromises.push(
              Api.dropMemberFromEvent.remove({
                member_id: checkedRows[k].id,
                event_id: $scope.howEvent.currentEvent.id,
              }).$promise
            );
          }
          $q.all(deletedParticipantPromises).then(function() {
            console.log('deleted');
            $scope.update();
          });
          swal('Deleted!', 'Your file has been deleted.', 'success');

          $('#eventInventoryTable-select-all').prop('checked', false);
          $('input[type="checkbox"]', rows).prop('checked', false);
          // console.log(checkedRows);
        });
      } // end else
    }; // end $scope.remove
  });
