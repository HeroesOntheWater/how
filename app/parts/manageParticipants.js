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
    event,
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance
  ) {
    'use strict';
    $scope.rows_selected = [];
    $scope.event = event;
    $scope.new_row = {
      key: '',
      name: {
        first: '',
        last: '',
      },
      email: '',
      phone: '',
    };
    $scope.eventForm;

    $scope.initialize = function() {
      $('#phone').mask('(999)999-9999');
    };

    $scope.addParticipant = function(email, key) {
      console.log($scope.eventForm);
      var ifNoData = false;
      var temp_key;
      var userData;
      if (!email) {
        swal('Oops...', 'The email field is required.', 'error');
        return;
      }
      email = email.trim();
      //check to see if the participant is a user at all.
      commonServices
        .getUserByEmail(email)
        .then(function(data) {
          if (data) {
            _.each(data, function(val, idx) {
              temp_key = idx;
              data[idx]['key'] = idx;
              userData = data;
            });
          } else {
            ifNoData = true;
          }

          //check if guest/participant has already been added
          return commonServices.getUserByEmailAtPath(
            email,
            '/events/' + key + '/participants'
          );
        })
        .then(function(part) {
          //user not already added, let's add the guest/participant
          if (!part) {
            //it's a registered user, so add as participant
            if (!ifNoData) {
              //check if the prospective participant is already signed up as a volunteer
              return commonServices.getUserByEmailAtPath(
                email,
                '/events/' + key + '/volunteers'
              );
            } else {
              //it's not a registered user, so add as guest
              //since it's a guest, check all inputs and then add the user.
              if (
                $scope.new_row.name.first &&
                $scope.new_row.name.last &&
                $scope.new_row.email &&
                $scope.new_row.phone &&
                $scope.new_row.phone.length === 13
              ) {
                commonServices.pushData(
                  '/events/' + $scope.event.key + '/participants',
                  $scope.new_row
                );
                throw [
                  'Success',
                  'The guest has been added successfully!',
                  'success',
                ];
              } else {
                throw [
                  'Oops...',
                  'First name, Last name, email, and phone is required to register a guest',
                  'error',
                ];
              }
            }
          } else {
            throw [
              'Oops...',
              'That participant has already been added',
              'error',
            ];
          }
        })
        .then(function(vol) {
          //the participant is a volunteer
          if (vol) {
            //if they are a volunteer, then remove them from the volunteer table
            var entity_key = Object.keys(vol)[0];
            commonServices.removeData(
              '/events/' + key + '/volunteers/' + entity_key
            );
          }

          commonServices.pushData(
            '/events/' + key + '/participants',
            userData[temp_key]
          );
          throw [
            'Success',
            'The participant has been added successfully!',
            'success',
          ];
        })
        .catch(function(err) {
          console.log(err);
          swal(err[0], err[1], err[2]);
          $scope.reloadData();
        });
    };

    $scope.reloadData = function() {
      commonServices
        .getData('/events/' + $scope.event.key + '/participants')
        .then(function(data) {
          $scope.event.participants = data;
          $scope.buildTable();
        });
    };

    $scope.deleteParticipants = function() {
      $scope.rows_selected.forEach(function(val, idx) {
        commonServices.removeData(
          '/events/' + $scope.event.key + '/participants/' + val
        );
      });
      $scope.reloadData();
    };

    $scope.buildTable = function() {
      var i;
      var packet;
      var dataSet = [];
      var tmp = $scope.event.participants
        ? Object.keys($scope.event.participants).forEach(function(val, idx) {
            $scope.event.participants[val]['key'] = val;
            dataSet.push($scope.event.participants[val]);
          })
        : [];
      console.log('the dataset is ', dataSet);
      //dataGridUtil.buildMembersTableData(results);
      $scope.currId = ''; // holds value of the current row's member Id for CRUD ops
      $scope.checkedBoxes = [];

      angular.element(document).ready(function() {
        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };

        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#participantsTable'))) {
          $scope.participantsTable.destroy();
          console.log('inside the destroy');
        }

        $scope.participantsTable = $('#participantsTable').DataTable({
          // ajax: 'testData/members.json',
          data: dataSet,
          // scrollX: true,
          columns: [
            {
              title: 'KEY',
              data: 'key',
            },
            {
              title: 'First Name',
              data: 'name.first',
            },
            {
              title: 'Last Name',
              data: 'name.last',
            },
            {
              title: 'Email',
              data: 'email',
              orderable: false,
            },
            {
              title: 'Mobile #',
              data: 'phone',
              orderable: false,
            },
          ],
          columnDefs: [
            {
              targets: 0,
              searchable: false,
              orderable: false,
              className: 'dt-body-center',
              render: function() {
                return '<input type="checkbox" class="participantsTable-select">';
              },
            },
          ],
          order: [[1, 'desc']],
          headerCallback: function(thead) {},
          rowCallback: function(row, data, dataIndex) {
            // Get row ID
            var rowId = data[0];

            // If row ID is in the list of selected row IDs
            if ($.inArray(rowId, $scope.rows_selected) !== -1) {
              $(row)
                .find('input[type="checkbox"]')
                .prop('checked', true);
              $(row).addClass('selected');
            }
          },
          drawCallback: function(settings) {
            //event bindings
            $('#addParticipant').click(function() {
              $scope.addParticipant($scope.new_row.email, event.key);
            });

            $('#deleteParticipants').click(function() {
              $scope.deleteParticipants();
            });

            $('#firstName').on('keyup', function() {
              $scope.new_row.name.first = $(this).val();
            });

            $('#firstName').on('change', function() {
              $scope.new_row.name.first = $(this).val();
            });

            $('#lastName').on('keyup', function() {
              $scope.new_row.name.last = $(this).val();
            });

            $('#lastName').on('change', function() {
              $scope.new_row.name.last = $(this).val();
            });

            $('#email').on('keyup', function() {
              $scope.new_row.email = $(this).val();
            });

            $('#email').on('change', function() {
              $scope.new_row.email = $(this).val();
            });

            $('#phone').on('keyup', function() {
              $scope.new_row.phone = $(this).val();
            });

            $('#phone').on('change', function() {
              $scope.new_row.phone = $(this).val();
            });
            //end event bindings

            // Handle click on checkbox
            $('.participantsTable-select').on('click', function(e) {
              var $row = $(this).closest('tr');

              // Get row data
              var data = $scope.participantsTable.row($row).data();

              // Get row ID
              var rowId = data['key'];

              // Determine whether row ID is in the list of selected row IDs
              var index = $.inArray(rowId, $scope.rows_selected);

              // If checkbox is checked and row ID is not in list of selected row IDs
              if (this.checked && index === -1) {
                $scope.rows_selected.push(rowId);

                // Otherwise, if checkbox is not checked and row ID is in list of selected row IDs
              } else if (!this.checked && index !== -1) {
                $scope.rows_selected.splice(index, 1);
              }

              if (this.checked) {
                $row.addClass('selected');
              } else {
                $row.removeClass('selected');
              }
              $scope.$apply();
              // Update state of "Select all" control
              // updateDataTableSelectAllCtrl(table);

              // Prevent click event from propagating to parent
              e.stopPropagation();
            });
          },
        });
      });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
