/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:DirectoryCtrl
 * @description
 * # DirectoryCtrl
 * Controller of management console - directory
 */
angular
  .module('ohanaApp')
  .controller('DirectoryCtrl', function(
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModal,
    dataGridUtil,
    userService
  ) {
    'use strict';

    $scope.$on('modalClosing', function() {
      $scope.update();
    });

    $scope.buildTable = function(results) {
      var i;
      var packet;
      var dataSet = dataGridUtil.buildMembersTableData(results);
      $scope.currId = ''; // holds value of the current row's member Id for CRUD ops
      $scope.checkedBoxes = [];

      angular.element(document).ready(function() {
        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };

        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#membersTable'))) {
          $scope.membersTable.destroy();
        }

        $scope.membersTable = $('#membersTable').DataTable({
          // ajax: 'testData/members.json',
          responsive: true,
          data: dataSet,
          columns: [
            {},
            {
              title: 'KEY',
              data: 'key',
            },
            {
              title: 'First Name',
              data: 'first',
            },
            {
              title: 'Last Name',
              data: 'last',
            },
            {
              title: 'DOB',
              data: 'dob',
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
              title: 'Role',
              data: 'role',
            },
            {
              title: 'Primary Chapter',
              data: 'primaryChapter',
            },
            {
              title: 'Secondary Chapters',
              data: 'chapters[, ]',
            },
            {
              title: 'Service Branch',
              data: 'branch',
            },
          ],
          columnDefs: [
            {
              targets: 1,
              visible: false,
            },
            {
              targets: 0,
              searchable: false,
              orderable: false,
              className: 'dt-body-center',
              render: function() {
                return '<input type="checkbox" id="membersTable-select">';
              },
            },
            {
              targets: 3,
              width: '50px',
            },
            {
              targets: 5,
              width: '90px',
            },
          ],
          order: [[3, 'asc']],
          headerCallback: function(thead) {
            $(thead)
              .find('th')
              .eq(0)
              .html('<input type="checkbox" id="membersTable-select-all">');
          },
          rowCallback: function(row, data, index) {
            $(row)
              .find('input[type="checkbox"]')
              .eq(0)
              .attr('value', data.key);
            $(row)
              .find('input[type="checkbox"]')
              .eq(0)
              .attr('data-row-id', data.row_id);
            $(row)
              .children()
              .eq(1)
              .addClass('tdFname');
            $(row)
              .children()
              .eq(2)
              .addClass('tdLname');
            $(row)
              .children()
              .eq(3)
              .addClass('tdDob');
            $(row)
              .children()
              .eq(4)
              .addClass('tdEmail'); // email checking disabled
            $(row)
              .children()
              .eq(5)
              .addClass('tdTelly');
            $(row)
              .children()
              .eq(6)
              .addClass('tdSelectRole');
            $(row)
              .children()
              .eq(7)
              .addClass('tdPrimaryChapter');
            $(row)
              .children()
              .eq(8)
              .addClass('tdChapters');
            $(row)
              .children()
              .eq(9)
              .addClass('tdMil');
            for (i = 1; i < 10; i++) {
              if (i !== 4) {
                $(row)
                  .children()
                  .eq(i)
                  .wrapInner(
                    '<a class="editable editable-click" style="border: none;"></a>'
                  );
              }
            }
            return row;
          },
          drawCallback: function(settings) {
            // set currentId to user being edited
            $('#membersTable').off('click', 'tr');
            $('#membersTable').on('click', 'tr', function() {
              $scope.currId = $(this)
                .find('input[type="checkbox"]')
                .val();

              if (
                $(this)
                  .find('input[type="checkbox"]')
                  .is(':checked')
              ) {
                $scope.checkedBoxes.push($scope.currId);
              } else {
                for (var i = 0; i < $scope.checkedBoxes.length; i++) {
                  if ($scope.checkedBoxes[i] === $scope.currId) {
                    $scope.checkedBoxes.splice(i, 1);
                  }
                }
              }
            });
            // editable field definitions and CRUD ops
            $('#membersTable .tdFname a').editable({
              type: 'text',
              name: 'first',
              placement: 'bottom',
              emptytext: 'none',
              display: false,
              url: function(params) {
                if (params.value !== '') {
                  var packet = params.value;
                  var path = '/userData/' + $scope.currId + '/name/first/';
                  commonServices.updateData(path, packet);
                  if ($scope.currId === userService.getId()) {
                    var tempData = userService.getUserData();
                    tempData.name.first = packet;
                    userService.setUserData(tempData);
                    userService.setUserName(
                      tempData.name.first,
                      tempData.name.last
                    );
                  }
                  $scope.update();
                }
              },
            });
            $('#membersTable .tdLname a').editable({
              type: 'text',
              name: 'last',
              placement: 'bottom',
              emptytext: 'none',
              display: false,
              url: function(params) {
                if (params.value !== '') {
                  var packet = params.value;
                  var path = '/userData/' + $scope.currId + '/name/last/';
                  commonServices.updateData(path, packet);
                  if ($scope.currId === userService.getId()) {
                    var tempData = userService.getUserData();
                    tempData.name.last = packet;
                    userService.setUserData(tempData);
                    userService.setUserName(
                      tempData.name.first,
                      tempData.name.last
                    );
                  }
                  $scope.update();
                }
              },
            });
            $('#membersTable .tdDob a').editable({
              type: 'combodate',
              name: 'DOB',
              placement: 'bottom',
              emptytext: 'none',
              format: 'MM/DD/YYYY',
              viewformat: 'MM/DD/YYYY',
              template: 'MMM / DD / YYYY',
              combodate: {
                template: 'MMM / DD / YYYY',
                minYear: 1900,
                maxYear: 2020,
              },
              display: false,
              url: function(params) {
                if (params.value !== '') {
                  var packet = params.value;
                  var path = '/userData/' + $scope.currId + '/DOB/';
                  commonServices.updateData(path, packet);
                  if ($scope.currId === userService.getId()) {
                    var tempData = userService.getUserData();
                    tempData.DOB = packet;
                    userService.setUserData(tempData);
                  }
                  $scope.update();
                }
              },
            });
            $('#membersTable .tdTelly a').editable({
              type: 'text',
              name: 'phone',
              placement: 'bottom',
              emptytext: 'none',
              tpl: "<input id='phonenum'>",
              display: false,
              url: function(params) {
                if (params.value !== '') {
                  var packet = params.value;
                  var path = '/userData/' + $scope.currId + '/phone/';
                  commonServices.updateData(path, packet);
                  if ($scope.currId === userService.getId()) {
                    var tempData = userService.getUserData();
                    tempData.phone = packet;
                    userService.setUserData(tempData);
                  }
                  $scope.update();
                }
              },
            });

            $(document).on('click', '#membersTable .tdTelly a', function() {
              $('#phonenum').mask('(999)999-9999');
            });

            $('#membersTable .tdSelectRole a').editable({
              type: 'select',
              name: 'role',
              placement: 'bottom',
              emptytext: 'none',
              showbuttons: false,
              display: false,
              url: function(params) {
                if (params.value !== '') {
                  var currentUserUID = userService.getId();
                  if ($scope.currId !== currentUserUID) {
                    var packet = {
                      role: params.value,
                    };
                    var path = '/userRoles/' + $scope.currId;
                    commonServices.updateData(path, packet);
                    if ($scope.currId === userService.getId()) {
                      userService.setRole(packet);
                    }
                    $scope.update();
                  } else {
                    swal('Alert', 'You cannot edit your own role!', 'error');
                  }
                }
              },
              source: function() {
                var currentUserRole = userService.getRole();
                if (currentUserRole === 'National Staff') {
                  return $rootScope.siteData.roles;
                } else {
                  var newRoles = ['Participant', 'Volunteer', 'Chapter Lead'];
                  return newRoles;
                }
              },
            });
            $('#membersTable').off('click', '.tdPrimaryChapter a');
            $('#membersTable').on('click', '.tdPrimaryChapter a', function() {
              var self = this;
              var modalInstance = $uibModal.open({
                templateUrl: '/parts/changeChapter.html',
                controller: 'ChangeChapterCtrl',
                resolve: {
                  selectedUID: function() {
                    return self.parentElement.parentElement.children[0]
                      .firstChild.value;
                  },
                },
              });
            });
            $('#membersTable').off('click', '.tdChapters');
            $('#membersTable').on('click', '.tdChapters', function() {
              var self = this;
              var modalInstance = $uibModal.open({
                templateUrl: '/parts/manageadditionalchapters.html',
                controller: 'ManageAdditionalChapters',
                resolve: {
                  selectedUID: function() {
                    return self.parentElement.children[0].firstChild.value;
                  },
                },
              });
            });
            $('#membersTable .tdMil a').editable({
              type: 'text',
              name: 'branch',
              placement: 'bottom',
              emptytext: 'none',
              display: false,
              url: function(params) {
                if (params.value !== '') {
                  var packet = params.value;
                  var path = '/userData/' + $scope.currId + '/branch/';
                  commonServices.updateData(path, packet);
                  if ($scope.currId === userService.getId()) {
                    var tempData = userService.getUserData();
                    tempData.branch = packet;
                    userService.setUserData(tempData);
                  }
                  $scope.update();
                }
              },
            });
          },
        });

        // Handle Mobile Events.
        $scope.membersTable.on('responsive-display', function(
          e,
          datatable,
          row,
          showHide,
          update
        ) {
          $scope.currId = row.data().key;
          var currentElement = $(this)
            .find('ul[data-dtr-index="' + row.index() + '"]')
            .children();
          if (showHide) {
            _.each(currentElement, function(n) {
              switch ($(n).data('dt-column')) {
                case 2:
                  // First Name
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="2"]>span.dtr-data').editable({
                    type: 'text',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    display: false,
                    url: function(params) {
                      if (params.value !== '') {
                        var packet = params.value;
                        var path = '/userData/' + params.name + '/name/first/';
                        commonServices.updateData(path, packet);
                        if (params.name === userService.getId()) {
                          var tempData = userService.getUserData();
                          tempData.name.first = packet;
                          userService.setUserData(tempData);
                          userService.setUserName(
                            tempData.name.first,
                            tempData.name.last
                          );
                        }
                        $scope.update();
                      }
                    },
                  });
                  break;
                case 3:
                  // Last Name
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="3"]>span.dtr-data').editable({
                    type: 'text',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    display: false,
                    url: function(params) {
                      if (params.value !== '') {
                        var packet = params.value;
                        var path = '/userData/' + params.name + '/name/last/';
                        commonServices.updateData(path, packet);
                        if (params.name === userService.getId()) {
                          var tempData = userService.getUserData();
                          tempData.name.last = packet;
                          userService.setUserData(tempData);
                          userService.setUserName(
                            tempData.name.first,
                            tempData.name.last
                          );
                        }
                        $scope.update();
                      }
                    },
                  });
                  break;
                case 4:
                  // DOB
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="4"]>span.dtr-data').editable({
                    type: 'combodate',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    format: 'MM/DD/YYYY',
                    viewformat: 'MM/DD/YYYY',
                    template: 'MMM / DD / YYYY',
                    combodate: {
                      template: 'MMM / DD / YYYY',
                      minYear: 1900,
                      maxYear: 2020,
                    },
                    display: false,
                    url: function(params) {
                      if (params.value !== '') {
                        var packet = params.value;
                        var path = '/userData/' + params.name + '/DOB/';
                        commonServices.updateData(path, packet);
                        if (params.name === userService.getId()) {
                          var tempData = userService.getUserData();
                          tempData.DOB = packet;
                          userService.setUserData(tempData);
                        }
                        $scope.update();
                      }
                    },
                  });
                  break;
                case 5:
                  // email
                  break;
                case 6:
                  // Mobile
                  $(
                    document
                  ).on(
                    'click',
                    'ul>li[data-dtr-index="6"]>span.dtr-data',
                    function() {
                      $('#phonenum').mask('(999)999-9999');
                    }
                  );
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="6"]>span.dtr-data').editable({
                    type: 'text',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    tpl: "<input id='phonenum'>",
                    display: false,
                    url: function(params) {
                      if (params.value !== '') {
                        var packet = params.value;
                        var path = '/userData/' + params.name + '/phone/';
                        commonServices.updateData(path, packet);
                        if (params.name === userService.getId()) {
                          var tempData = userService.getUserData();
                          tempData.phone = packet;
                          userService.setUserData(tempData);
                        }
                        $scope.update();
                      }
                    },
                  });
                  break;
                case 7:
                  // Role
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="7"]>span.dtr-data').editable({
                    type: 'select',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    showbuttons: false,
                    display: false,
                    url: function(params) {
                      if (params.value !== '') {
                        var currentUserUID = userService.getId();
                        if ($scope.currId !== currentUserUID) {
                          var packet = {
                            role: params.value,
                          };
                          var path = '/userRoles/' + params.name;
                          commonServices.updateData(path, packet);
                          if (params.name === userService.getId()) {
                            userService.setRole(packet);
                          }
                          $scope.update();
                        } else {
                          swal(
                            'Alert',
                            'You cannot edit your own role!',
                            'error'
                          );
                        }
                      }
                    },
                    source: function() {
                      var currentUserRole = userService.getRole();
                      if (currentUserRole === 'National Staff') {
                        return $rootScope.siteData.roles;
                      } else {
                        var newRoles = [
                          'Participant',
                          'Volunteer',
                          'Chapter Lead',
                        ];
                        return newRoles;
                      }
                    },
                  });
                  break;
                case 8:
                  // Primary Chapter
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('#membersTable').off(
                    'click',
                    'ul>li[data-dtr-index="8"]>span.dtr-data'
                  );
                  $(
                    '#membersTable'
                  ).on(
                    'click',
                    'ul>li[data-dtr-index="8"]>span.dtr-data',
                    function() {
                      var self = this;
                      var modalInstance = $uibModal.open({
                        templateUrl: '/parts/changeChapter.html',
                        controller: 'ChangeChapterCtrl',
                        resolve: {
                          selectedUID: function() {
                            var tempRowId = $(self)
                              .parent()
                              .data('dt-row');
                            var curKey = $(self)
                              .parent()
                              .parent()
                              .parent()
                              .parent()
                              .parent()
                              .find('input[data-row-id="' + tempRowId + '"]')
                              .val();
                            return curKey;
                          },
                        },
                      });
                    }
                  );
                  break;
                case 9:
                  // Secondary Chapter
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('#membersTable').off(
                    'click',
                    'ul>li[data-dtr-index="9"]>span.dtr-data'
                  );
                  $(
                    '#membersTable'
                  ).on(
                    'click',
                    'ul>li[data-dtr-index="9"]>span.dtr-data',
                    function() {
                      var self = this;
                      var modalInstance = $uibModal.open({
                        templateUrl: '/parts/manageadditionalchapters.html',
                        controller: 'ManageAdditionalChapters',
                        resolve: {
                          selectedUID: function() {
                            var tempRowId = $(self)
                              .parent()
                              .data('dt-row');
                            var curKey = $(self)
                              .parent()
                              .parent()
                              .parent()
                              .parent()
                              .parent()
                              .find('input[data-row-id="' + tempRowId + '"]')
                              .val();
                            return curKey;
                          },
                        },
                      });
                    }
                  );
                  break;
                case 10:
                  // Mil Affil
                  $('ul>li[data-dtr-index="10"]>span.dtr-data').editable({
                    type: 'text',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    display: false,
                    url: function(params) {
                      if (params.value !== '') {
                        var packet = params.value;
                        var path = '/userData/' + params.name + '/branch/';
                        commonServices.updateData(path, packet);
                        if ($scope.currId === userService.getId()) {
                          var tempData = userService.getUserData();
                          tempData.branch = packet;
                          userService.setUserData(tempData);
                        }
                        $scope.update();
                      }
                    },
                  });
                  break;
                default:
                  // Do nothing
                  console.log('Should not be here');
                  break;
              }
            });
          }
        });

        // Handle click on "Select all" control
        $('#membersTable-select-all').on('click', function() {
          // Get all rows with search applied
          var rows = $scope.membersTable
            .rows({
              search: 'applied',
            })
            .nodes();
          // Check/uncheck checkboxes for all rows in the table
          $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });

        // Handle click on checkbox to set state of "Select all" control
        $(
          '#membersTable tbody'
        ).on('change', 'input[type="checkbox"]', function() {
          // If checkbox is not checked
          if (!this.checked) {
            var el = $('#membersTable-select-all').get(0);
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
      var newDataSet = commonServices.getData('/userData/');
      var newRoleData = commonServices.getData('/userRoles/');
      var currentUserRole = userService.getRole();
      var currentUserData = userService.getUserData();
      $q.all([newDataSet, newRoleData]).then(function(userData) {
        var users = [],
          roles = [],
          keys = [];
        var i = 0;

        _.each(userData[1], function(value, key) {
          switch (currentUserRole) {
            case 'National Staff':
              roles.push(value.role);
              keys.push(key);
              break;
            case 'Chapter Lead':
              if (
                value.role === 'Participant' ||
                value.role === 'Volunteer' ||
                value.role === 'Chapter Lead'
              ) {
                roles.push(value.role);
                keys.push(key);
              }
              break;
            default:
              console.log('should not be here');
          }
        });

        _.each(keys, function() {
          _.each(userData[0], function(value, key) {
            switch (currentUserRole) {
              case 'National Staff':
                if (keys[i] === key) {
                  value.key = key;
                  value.role = roles[i];
                  users.push(value);
                }
                break;
              case 'Chapter Lead':
                if (
                  keys[i] === key &&
                  currentUserData.Chapter === value.Chapter
                ) {
                  value.key = key;
                  value.role = roles[i];
                  users.push(value);
                }
                break;
              default:
                console.log('should not be here');
            }
          });
          i++;
        });
        $scope.buildTable(users);
      });
    }; // end $scope.update

    $scope.roleChangeRequests = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/parts/managerolechangerequest.html',
        controller: 'ManageRoleChangeRequestCtrl',
      });
    };

    $scope.chapterStatus = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/parts/chapterStatus.html',
        controller: 'ChapterStatusCtrl',
      });
    };

    $scope.remove = function() {
      if ($scope.checkedBoxes.length === 0) {
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
          _.each($scope.checkedBoxes, function(userKey) {
            commonServices.removeData('/userData/' + userKey);
            commonServices.removeData('/userRoles/' + userKey);
          });
          swal('Deleted!', 'Your file has been deleted.', 'success');
          $scope.update();
        });
      } // end else
    }; // end $scope.remove
  });
