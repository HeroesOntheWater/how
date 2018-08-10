/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:InventoryCtrl
 * @description
 * # InventoryCtrl
 * Controller of management console - inventory
 */
angular
  .module('ohanaApp')
  .controller('InventoryCtrl', function($scope, $uibModal, Api, dataGridUtil) {
    'use strict';

    $scope.buildTable = function(results) {
      var i;
      var packet;
      var dataSet = dataGridUtil.buildInventoryTableData(results);
      $scope.currId = ''; // holds value of the current row's inventory Id for CRUD ops

      angular.element(document).ready(function() {
        $scope.userChapterId = '5788738883feb0b4358e8cd1'; // TODO HARDCODED CHANGE THIS

        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };

        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#inventoryTable'))) {
          $scope.inventoryTable.destroy();
        }

        $scope.inventoryTable = $('#inventoryTable').DataTable({
          //					ajax: 'testData/inventory.json',
          data: dataSet,
          columns: [
            {},
            {
              title: 'ID',
              data: 'DT_RowId',
            },
            {
              title: 'Item Name',
              data: 'name_of_item',
              orderable: false,
            },
            {
              title: 'Category',
              data: 'category',
            },
            {
              title: 'Condition',
              data: 'condition',
            },
            {
              title: 'Purchase Date',
              data: 'purchase_date',
            },
            {
              title: 'Reserved?',
              data: 'reservedFlag',
            },
            {
              title: 'Owned By',
              data: 'chapter',
            },
            {
              title: 'Notes',
              data: 'notes',
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
                  '<input type="checkbox" id="inventoryTable-select" value="' +
                  $('<div/>')
                    .text(data)
                    .html() +
                  '">'
                );
              },
            },
            {
              targets: 4,
              width: '40px',
            },
            {
              targets: 5,
              width: '35px',
            },
            {
              targets: 6,
              width: '40px',
            },
          ],
          order: [[3, 'asc']],
          headerCallback: function(thead) {
            $(thead)
              .find('th')
              .eq(0)
              .html('<input type="checkbox" id="inventoryTable-select-all">');
          },
          rowCallback: function(row, data, index) {
            $(row)
              .children()
              .eq(1)
              .addClass('tdItemName');
            $(row)
              .children()
              .eq(2)
              .addClass('tdCategory');
            $(row)
              .children()
              .eq(3)
              .addClass('tdCondition');
            $(row)
              .children()
              .eq(4)
              .addClass('tdPdate');
            $(row)
              .children()
              .eq(7)
              .addClass('tdNotes');
            for (i = 1; i < 5; i++) {
              $(row)
                .children()
                .eq(i)
                .wrapInner(
                  '<a class="editable editable-click" style="border: none;"></a>'
                );
            }
            $(row)
              .children()
              .eq(7)
              .wrapInner(
                '<a class="editable editable-click" style="border: none;"></a>'
              );
            return row;
          },
          drawCallback: function() {
            // set currentId to user being edited
            $('#inventoryTable').on('click', 'tr', function() {
              $scope.currId = $scope.inventoryTable.row(this).id();
            });
            // editable field definitions and CRUD ops
            $('#inventoryTable .tdItemName a').editable({
              type: 'text',
              name: 'name_of_item',
              placement: 'bottom',
              emptytext: 'null',
              url: function(params) {
                var packet = {
                  item_id: $scope.currId,
                  chapter_id: $scope.userChapterId,
                  name_of_item: params.value,
                };
                Api.chapterAddItem.update(
                  packet,
                  function(successMsg) {
                    console.log('heyo');
                  },
                  function(errorMsg) {
                    console.log('error');
                  }
                );
              },
            });
            $('#inventoryTable .tdCategory a').editable({
              type: 'select',
              name: 'category',
              placement: 'bottom',
              emptytext: 'null',
              showbuttons: false,
              url: function(params) {
                var packet = {
                  item_id: $scope.currId,
                  chapter_id: $scope.userChapterId,
                  category: params.value,
                };
                Api.chapterAddItem.update(
                  packet,
                  function(successMsg) {
                    console.log('heyo');
                  },
                  function(errorMsg) {
                    console.log('error');
                  }
                );
              },
              source: [
                {
                  value: 0,
                  text: 'Kayaks and Equipment',
                },
                {
                  value: 1,
                  text: 'Fishing Equipment',
                },
                {
                  value: 2,
                  text: 'Safety and PFDs',
                },
                {
                  value: 3,
                  text: 'Event Support',
                },
                {
                  value: 4,
                  text: 'Chapter Support',
                },
                {
                  value: 5,
                  text: 'Misc',
                },
              ],
            });
            $('#inventoryTable .tdCondition a').editable({
              type: 'select',
              name: 'condition',
              placement: 'bottom',
              emptytext: 'null',
              showbuttons: false,
              url: function(params) {
                var packet = {
                  item_id: $scope.currId,
                  chapter_id: $scope.userChapterId,
                  condition: params.value,
                };
                Api.chapterAddItem.update(
                  packet,
                  function(successMsg) {
                    console.log('heyo');
                  },
                  function(errorMsg) {
                    console.log('error');
                  }
                );
              },
              source: [
                {
                  value: 0,
                  text: 'New',
                },
                {
                  value: 1,
                  text: 'Good',
                },
                {
                  value: 2,
                  text: 'Fair',
                },
                {
                  value: 3,
                  text: 'Poor',
                },
                {
                  value: 4,
                  text: 'Broken',
                },
              ],
            });
            $('#inventoryTable .tdPdate a').editable({
              type: 'combodate',
              name: 'puchase_date',
              placement: 'bottom',
              emptytext: 'null',
              format: 'YYYY-MM-DD',
              viewformat: 'MM/DD/YYYY',
              template: 'MMM / DD / YYYY',
              combodate: {
                template: 'MMM / DD / YYYY',
                minYear: 1900,
                maxYear: 2020,
              },
              url: function(params) {
                var packet = {
                  item_id: $scope.currId,
                  chapter_id: $scope.userChapterId,
                  purchase_date: params.value,
                };
                Api.chpaterAddItem.update(
                  packet,
                  function(successMsg) {
                    console.log('heyo');
                  },
                  function(errorMsg) {
                    console.log('error');
                  }
                );
              },
            });
            $('#inventoryTable .tdNotes a').editable({
              type: 'textarea',
              name: 'notes',
              placement: 'bottom',
              emptytext: 'null',
              url: function(params) {
                var packet = {
                  item_id: $scope.currId,
                  chapter_id: $scope.userChapterId,
                  notes: params.value,
                };
                Api.chapterAddItem.update(
                  packet,
                  function(successMsg) {
                    console.log('heyo');
                  },
                  function(errorMsg) {
                    console.log('error');
                  }
                );
              },
            });
          },
        }); //.columns.adjust().draw();

        // Handle click on "Select all" control
        $('#inventoryTable-select-all').on('click', function() {
          // Get all rows with search applied
          var rows = $scope.inventoryTable
            .rows({
              search: 'applied',
            })
            .nodes();
          // Check/uncheck checkboxes for all rows in the table
          $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });

        // Handle click on checkbox to set state of "Select all" control
        $('#inventoryTable tbody').on(
          'change',
          'input[type="checkbox"]',
          function() {
            // If checkbox is not checked
            if (!this.checked) {
              var el = $('#inventoryTable-select-all').get(0);
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
      Api.item.query().$promise.then(
        function(data) {
          //				console.log(data);
          $scope.buildTable(data);
          $scope.dataStack = data;
        },
        function(data) {
          //				console.log(data);
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

    $scope.add = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/newItemInventoryForm.html',
        controller: 'NewItemInventoryFormCtrl',
      });
      if (!modalInstance) {
        $scope.update();
      }
    }; // end $scope.add

    $scope.remove = function() {
      var j, k;
      var rows = $scope.inventoryTable
          .rows({
            search: 'applied',
          })
          .nodes(),
        checkedRows = [];
      for (j = 0; j < rows.length; j++) {
        // console.log($('input[type="checkbox"]', rows[i]).prop('checked'));
        if ($('input[type="checkbox"]', rows[j]).prop('checked')) {
          checkedRows.push($scope.dataStack[j]);
        }
      }
      // console.log(checkedRows.length);

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
          for (k = 0; k < checkedRows.length; k++) {}
          swal('Deleted!', 'Your file has been deleted.', 'success');

          $('#inventoryTable-select-all').prop('checked', false);
          $('input[type="checkbox"]', rows).prop('checked', false);
          // console.log(checkedRows);
          $scope.update();
        });
      } // end else
    }; // end $scope.remove
  });
