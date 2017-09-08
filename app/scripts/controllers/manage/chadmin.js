/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ChadminCtrl
 * @description
 * # ChadminCtrl
 * Controller of management console - chapter administration
 */
angular
  .module('ohanaApp')
  .controller('ChadminCtrl', function(
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModal,
    dataGridUtil,
    userService
  ) {
    'use strict';
    $scope.chapterTableData = {};

    $scope.$on('modalClosing', function() {
      $scope.update();
    });

    $scope.buildTable = function(results) {
      var i;
      var packet;
      var dataSet = dataGridUtil.buildChaptersTableData(results);
      $scope.chapterTableData = dataSet;
      $scope.currId = ''; // holds value of the current row's member Id for CRUD ops
      $scope.checkedBoxes = [];

      angular.element(document).ready(function() {
        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };

        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#chaptersTable'))) {
          $scope.chaptersTable.destroy();
        }

        $scope.chaptersTable = $('#chaptersTable').DataTable({
          // ajax: 'testData/members.json',
          data: dataSet,
          columns: [
            {},
            {
              title: 'KEY',
              data: 'zip',
            },
            {
              title: 'Chapter Name',
              data: 'name',
            },
            {
              title: 'Description',
              data: 'description',
            },
            {
              title: 'Chapter Admin',
              data: 'chadmin',
            },
            {
              title: 'Region',
              data: 'region',
            },
            {
              title: 'State',
              data: 'state',
            },
            {
              title: 'Zip',
              data: 'zip',
              orderable: false,
            },
            {
              title: 'Email',
              data: 'email',
              orderable: false,
            },
            {
              title: 'Website',
              data: 'facebook_link',
            },
            {
              title: 'Location',
              data: 'googleMaps_Link',
            },
            {
              title: 'Donations',
              data: 'donation_link',
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
                return '<input type="checkbox" id="chaptersTable-select">';
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
              .html('<input type="checkbox" id="chaptersTable-select-all">');
          },
          rowCallback: function(row, data, index) {
            $(row)
              .find('input[type="checkbox"]')
              .eq(0)
              .attr('value', data.key);
            $(row)
              .children()
              .eq(1)
              .addClass('tdCName');
            $(row)
              .children()
              .eq(2)
              .addClass('tdDescription');
            $(row)
              .children()
              .eq(3)
              .addClass('tdChapterAdmin');
            $(row)
              .children()
              .eq(4)
              .addClass('tdSelectRegion');
            $(row)
              .children()
              .eq(5)
              .addClass('tdSelectState');
            $(row)
              .children()
              .eq(6)
              .addClass('tdSelectZip');
            $(row)
              .children()
              .eq(7)
              .addClass('tdEmail'); // email checking disabled
            for (i = 2; i < 7; i++) {
              if (i != 4 && i != 5 && i != 6) {
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
            $('#chaptersTable').off('click', 'tr');
            $('#chaptersTable').on('click', 'tr', function() {
              $scope.currId = $(this)
                .find('input[type="checkbox"]')
                .val();
              $scope.editValue = $(this)[0].cells;
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
            $('#chaptersTable .tdCName  a').editable({
              type: 'text',
              name: 'Chapter Name',
              placement: 'bottom',
              emptytext: 'none',
              url: function(params) {
                var packet = params.value;
                var packet2 = {
                  region: $scope.editValue[4].textContent,
                  text: params.value,
                  value: params.value,
                };
                var path =
                  '/Regions/' +
                  $scope.editValue[4].textContent +
                  '/' +
                  $scope.editValue[5].textContent +
                  '/' +
                  $($scope.editValue)
                    .find('#chaptersTable-select')
                    .val() +
                  '/name';
                var path2 =
                  '/siteData/chapters/' +
                  $($scope.editValue)
                    .find('#chaptersTable-select')
                    .val();
                commonServices.updateData(path, packet);
                commonServices.updateData(path2, packet2);
              },
            });
            $('#chaptersTable .tdDescription a').editable({
              type: 'text',
              name: 'description',
              placement: 'bottom',
              emptytext: 'none',
              url: function(params) {
                var packet = params.value;
                var path =
                  '/Regions/' +
                  $scope.editValue[4].textContent +
                  '/' +
                  $scope.editValue[5].textContent +
                  '/' +
                  $($scope.editValue)
                    .find('#chaptersTable-select')
                    .val() +
                  '/description';
                commonServices.updateData(path, packet);
              },
            });
            $('#chaptersTable .tdChapterAdmin a').editable({
              type: 'text',
              name: 'chadmin',
              placement: 'bottom',
              emptytext: 'none',
              url: function(params) {
                var packet = params.value;
                var path =
                  '/Regions/' +
                  $scope.editValue[4].textContent +
                  '/' +
                  $scope.editValue[5].textContent +
                  '/' +
                  $($scope.editValue)
                    .find('#chaptersTable-select')
                    .val() +
                  '/lead';
                commonServices.updateData(path, packet);
              },
            });
            $('#chaptersTable .tdSelectZip a').editable({
              type: 'text',
              name: 'zip',
              placement: 'bottom',
              emptytext: 'none',
              url: function(params) {
                var packet = params.value;
                var path =
                  '/Regions/' +
                  $scope.editValue[4].textContent +
                  '/' +
                  $scope.editValue[5].textContent +
                  '/' +
                  $($scope.editValue)
                    .find('#chaptersTable-select')
                    .val() +
                  '/zip';
                commonServices.updateData(path, packet);
              },
            });
            $('#chaptersTable .tdEmail a').editable({
              type: 'email',
              name: 'email',
              placement: 'bottom',
              emptytext: 'none',
              url: function(params) {
                var packet = params.value;
                var path =
                  '/Regions/' +
                  $scope.editValue[4].textContent +
                  '/' +
                  $scope.editValue[5].textContent +
                  '/' +
                  $($scope.editValue)
                    .find('#chaptersTable-select')
                    .val() +
                  '/email';
                commonServices.updateData(path, packet);
              },
            });
          },
        });

        // Handle click on "Select all" control
        $('#chaptersTable-select-all').on('click', function() {
          // Get all rows with search applied
          var rows = $scope.chaptersTable
            .rows({
              search: 'applied',
            })
            .nodes();
          // Check/uncheck checkboxes for all rows in the table
          $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });

        // Handle click on checkbox to set state of "Select all" control
        $(
          '#chaptersTable tbody'
        ).on('change', 'input[type="checkbox"]', function() {
          // If checkbox is not checked
          if (!this.checked) {
            var el = $('#chaptersTable-select-all').get(0);
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
      var newRegionsSet = commonServices.getData('/Regions/');
      var currentUserRole = userService.getRole();
      var currentUserData = userService.getUserData();
      $q.all([newRegionsSet]).then(function(chapterData) {
        var chapters = [],
          regions = [],
          keys = [];
        var i = 0;
        _.each(chapterData[0], function(value, key) {
          switch (currentUserRole) {
            case 'admin':
            case 'National Staff':
              regions.push(value);
              keys.push(key);
              break;
            case 'Chapter Lead':
              if (
                value.role === 'Participant' ||
                value.role === 'Volunteer' ||
                value.role === 'Chapter Lead'
              ) {
                regions.push(value);
                keys.push(key);
              }
              break;
            default:
              console.log(
                'Not an admin, staff, or chapter ltm. Should not load data.'
              );
          }
        });

        _.each(keys, function() {
          _.each(chapterData[0], function(value, key) {
            switch (currentUserRole) {
              case 'admin':
              case 'National Staff':
                if (keys[i] === key) {
                  value.key = key;
                  value.regions = regions[i];
                  chapters.push(value);
                }
                break;
              case 'Chapter Lead':
                if (
                  keys[i] === key &&
                  currentUserData.Chapter === value.Chapter
                ) {
                  value.key = key;
                  value.regions = regions[i];
                  chapters.push(value);
                }
                break;
              default:
                console.log(
                  'Not an admin, staff, or chapter ltm. Should not load data.'
                );
            }
          });
          i++;
        });
        $scope.buildTable(chapters);
      });
    }; // end $scope.update

    $scope.addChapter = function() {
      console.log($scope.chaptersTable);
      var modalInstance = $uibModal.open({
        templateUrl: '/parts/chapterAdd.html',
        controller: 'ChapterAddCtrl',
      });

      modalInstance.result.then(function(parameter) {
        $scope.chaptersTable.row.add(parameter);
      });
    };

    $scope.removeChapter = function() {
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
            console.log($scope.checkedBoxes);

            //commonServices.removeData('/userData/' + userKey);
            //commonServices.removeData('/userRoles/' + userKey);
          });
          swal('Deleted!', 'Your file has been deleted.', 'success');
          $scope.update();
        });
      } // end else
    }; // end $scope.remove
  });
