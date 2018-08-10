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
      $scope.userRole = userService.getRole(); // Current Users Role, i.e. you...
      $scope.currId = ''; // holds value of the current selected row member Id for CRUD ops.
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
          data: dataSet,
          iDisplayLength: 5,
          aLengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, 'All']],
          columns: [
            {},
            {
              title: 'KEY',
              data: 'key',
            },
            {
              title: 'Status',
              data: 'active',
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
          responsive: {
            details: {
              type: 'column',
            },
          },
          columnDefs: [
            {
              targets: 1,
              visible: false,
            },
            {
              targets: 0,
              searchable: false,
              orderable: false,
              className: 'dt-body-center control',
              render: function() {
                return '<div id="member-row-data" style="width: 20px;">';
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
          headerCallback: _.noop,
          rowCallback: function(row, data, index) {
            $(row)
              .find('div#member-row-data')
              .attr('data-key', data.key);
            $(row)
              .find('div#member-row-data')
              .attr('data-row-index', index);
            $(row)
              .children()
              .eq(1)
              .addClass('tdStatus');
            $(row)
              .children()
              .eq(2)
              .addClass('tdFname')
              .css('word-break', 'break-word');
            $(row)
              .children()
              .eq(3)
              .addClass('tdLname')
              .css('word-break', 'break-word');
            $(row)
              .children()
              .eq(4)
              .addClass('tdDob');
            $(row)
              .children()
              .eq(5)
              .addClass('tdEmail');
            $(row)
              .children()
              .eq(6)
              .addClass('tdTelly');
            $(row)
              .children()
              .eq(7)
              .addClass('tdSelectRole');
            $(row)
              .children()
              .eq(8)
              .addClass('tdPrimaryChapter')
              .css('word-break', 'break-word');
            $(row)
              .children()
              .eq(9)
              .addClass('tdChapters')
              .css('word-break', 'break-word');
            $(row)
              .children()
              .eq(10)
              .addClass('tdMil')
              .css('word-break', 'break-word');
            for (i = 2; i < 11; i++) {
              if (i !== 5) {
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
            // Reset button and clear selected
            $('tbody')
              .find('tr')
              .css('background-color', '');
            $('#enableDisableBtn').addClass('disabled');
            $scope.currId = '';

            // Get the currently selected: state, Region, and chapterId.
            $('#membersTable').off('click', 'tbody tr[role="row"]');
            $('#membersTable').on('click', 'tbody tr[role="row"]', function() {
              // Set currently selected account.
              $scope.currId = $(this)
                .find('div#member-row-data')
                .data('key');

              // Feature only available for National Staff.
              if ($scope.userRole === 'National Staff') {
                $('tbody')
                  .find('tr')
                  .css('background-color', '');
                $(this).css('background-color', '#FFFFC4');
                $scope.currStatus = $(this)
                  .find('.tdStatus')
                  .text();
                $('#enableDisableBtn').removeClass('disabled');
                if ($scope.currStatus === 'Active') {
                  $('#enableDisableBtn').text('Disable Account');
                } else {
                  $('#enableDisableBtn').text('Enable Account');
                }
              }
            });

            // Clear selected value when user paginates
            $('#membersTable_paginate').off('click');
            $('#membersTable_paginate').on('click', function() {
              $('tbody')
                .find('tr')
                .css('background-color', '');
              $('#enableDisableBtn').addClass('disabled');
            });

            // editable field definitions and CRUD ops
            $('#membersTable .tdFname a').editable({
              type: 'text',
              name: 'first',
              placement: 'bottom',
              emptytext: 'none',
              display: false,
              validate: function(value) {
                if ($.trim(value) == '') {
                  return 'Invalid Entry';
                }
              },
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
              validate: function(value) {
                if ($.trim(value) == '') {
                  return 'Invalid Entry';
                }
              },
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
                  var path = '/userRoles/' + $scope.currId + '/role';
                  if ($scope.currId !== currentUserUID) {
                    commonServices.updateData(path, params.value);
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
              var selectedUserId = $(this)
                .parent()
                .parent()
                .find('div#member-row-data')
                .data('key');
              var modalInstance = $uibModal.open({
                templateUrl: '/modals/views/changeChapter.html',
                controller: 'ChangeChapterCtrl',
                resolve: {
                  selectedUID: function() {
                    return selectedUserId;
                  },
                },
              });
            });
            $('#membersTable').off('click', '.tdChapters');
            $('#membersTable').on('click', '.tdChapters', function() {
              var self = this;
              var selectedUserId = $(this)
                .parent()
                .find('div#member-row-data')
                .data('key');
              var modalInstance = $uibModal.open({
                templateUrl: '/modals/views/manageadditionalchapters.html',
                controller: 'ManageAdditionalChapters',
                resolve: {
                  selectedUID: function() {
                    return selectedUserId;
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
              validate: function(value) {
                if ($.trim(value) == '') {
                  return 'Invalid Entry';
                }
              },
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
                case 3:
                  // First Name
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="3"]>span.dtr-data').editable({
                    type: 'text',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    display: false,
                    validate: function(value) {
                      if ($.trim(value) == '') {
                        return 'Invalid Entry';
                      }
                    },
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
                case 4:
                  // Last Name
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="4"]>span.dtr-data').editable({
                    type: 'text',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    display: false,
                    validate: function(value) {
                      if ($.trim(value) == '') {
                        return 'Invalid Entry';
                      }
                    },
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
                case 5:
                  // DOB
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="5"]>span.dtr-data').editable({
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
                case 6:
                  // email
                  break;
                case 7:
                  // Mobile
                  $(document).on(
                    'click',
                    'ul>li[data-dtr-index="7"]>span.dtr-data',
                    function() {
                      $('#phonenum').mask('(999)999-9999');
                    }
                  );
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="7"]>span.dtr-data').editable({
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
                case 8:
                  // Role
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('ul>li[data-dtr-index="8"]>span.dtr-data').editable({
                    type: 'select',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    showbuttons: false,
                    display: false,
                    url: function(params) {
                      if (params.value !== '') {
                        var currentUserUID = userService.getId();
                        var path = '/userRoles/' + params.name + '/role';
                        if ($scope.currId !== currentUserUID) {
                          commonServices.updateData(path, params.value);
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
                case 9:
                  // Primary Chapter
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('#membersTable').off(
                    'click',
                    'ul>li[data-dtr-index="9"]>span.dtr-data'
                  );
                  $('#membersTable').on(
                    'click',
                    'ul>li[data-dtr-index="9"]>span.dtr-data',
                    function() {
                      var self = this;
                      var rowIndex = $(this)
                        .parent()
                        .parent()
                        .data('dtr-index');
                      var selectedUserId = $('table#membersTable>tbody')
                        .find(
                          'tr[role="row"]>td.dt-body-center>div[data-row-index="' +
                            rowIndex +
                            '"]'
                        )
                        .data('key');
                      var modalInstance = $uibModal.open({
                        templateUrl: '/modals/views/changeChapter.html',
                        controller: 'ChangeChapterCtrl',
                        resolve: {
                          selectedUID: function() {
                            return selectedUserId;
                          },
                        },
                      });
                    }
                  );
                  break;
                case 10:
                  // Secondary Chapter
                  $(n)
                    .find('span.dtr-data')
                    .addClass('editable editable-click');
                  $('#membersTable').off(
                    'click',
                    'ul>li[data-dtr-index="10"]>span.dtr-data'
                  );
                  $('#membersTable').on(
                    'click',
                    'ul>li[data-dtr-index="10"]>span.dtr-data',
                    function() {
                      var self = this;
                      var rowIndex = $(this)
                        .parent()
                        .parent()
                        .data('dtr-index');
                      var selectedUserId = $('table#membersTable>tbody')
                        .find(
                          'tr[role="row"]>td.dt-body-center>div[data-row-index="' +
                            rowIndex +
                            '"]'
                        )
                        .data('key');
                      var modalInstance = $uibModal.open({
                        templateUrl: '/modals/views/manageadditionalchapters.html',
                        controller: 'ManageAdditionalChapters',
                        resolve: {
                          selectedUID: function() {
                            return selectedUserId;
                          },
                        },
                      });
                    }
                  );
                  break;
                case 11:
                  // Mil Affil
                  $('ul>li[data-dtr-index="11"]>span.dtr-data').editable({
                    type: 'text',
                    name: $scope.currId,
                    placement: 'bottom',
                    emptytext: 'none',
                    display: false,
                    validate: function(value) {
                      if ($.trim(value) == '') {
                        return 'Invalid Entry';
                      }
                    },
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
      }); // end document ready
    }; // end $scope.buildTable

    $scope.update = function() {
      // Initialize Variables.
      var newDataSet, newRoleData;
      var currentUserRole = userService.getRole();
      var currentUserData = userService.getUserData();

      if (currentUserRole === 'Chapter Lead') {
        newDataSet = commonServices.queryChapterkey(
          currentUserData.Chapter.key
        );
        newRoleData = commonServices.getData('/userRoles/');
      } else if (currentUserRole === 'National Staff') {
        newDataSet = commonServices.getData('/userData/');
        newRoleData = commonServices.getData('/userRoles/');
      } else {
        console.error('Access Denied');
        return;
      }

      $q.all([newDataSet, newRoleData]).then(function(userData) {
        var users = [],
          roles = [],
          active = [],
          keys = [];
        var i = 0;

        _.each(userData[1], function(value, key) {
          if (
            currentUserRole === 'National Staff' ||
            (currentUserRole === 'Chapter Lead' &&
              value.role !== 'National Staff')
          ) {
            roles.push(value.role);
            active.push(value.active);
            keys.push(key);
          }
        });

        _.each(keys, function() {
          _.each(userData[0], function(value, key) {
            switch (currentUserRole) {
              case 'National Staff':
                if (keys[i] === key) {
                  value.key = key;
                  value.role = roles[i];
                  value.active = active[i];
                  users.push(value);
                }
                break;
              case 'Chapter Lead':
                if (
                  keys[i] === key &&
                  currentUserData.Chapter.key === value.Chapter.key
                ) {
                  value.key = key;
                  value.role = roles[i];
                  value.active = active[i];
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
        templateUrl: '/modals/views/managerolechangerequest.html',
        controller: 'ManageRoleChangeRequestCtrl',
      });
    };

    $scope.chapterStatus = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/chapterStatus.html',
        controller: 'ChapterStatusCtrl',
      });
    };

    $scope.enableDisable = function() {
      var currentUserUID = userService.getId();
      if ($scope.currId !== currentUserUID) {
        var path = '/userRoles/' + $scope.currId + '/active';
        if ($scope.currStatus === 'Active') {
          commonServices.updateData(path, false);
        } else {
          commonServices.updateData(path, true);
        }
        $scope.update();
      } else {
        swal('Alert', 'You cannot edit your own Status!', 'error');
      }
    };
  });
