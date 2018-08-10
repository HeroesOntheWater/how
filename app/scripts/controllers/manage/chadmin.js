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
          iDisplayLength: 5,
          aLengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, 'All']],
          columns: [
            {},
            {
              title: 'KEY',
              data: 'key',
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
                return '<div id="chapter-row-data">';
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
          rowCallback: function(row, data, index) {
            $(row)
              .find('div#chapter-row-data')
              .attr('data-key', data.key);
            $(row)
              .children()
              .eq(1)
              .addClass('tdCName')
              .css('word-break', 'break-word');
            $(row)
              .children()
              .eq(2)
              .addClass('tdDescription')
              .css('word-break', 'break-word');
            $(row)
              .children()
              .eq(3)
              .addClass('tdChapterAdmin')
              .css('word-break', 'break-word');
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
              .addClass('tdEmail');
            for (i = 1; i < 7; i++) {
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
            // Get the currently selected: state, Region, and chapterId.
            $('#chaptersTable').off('click', 'tbody tr[role="row"]');
            $('#chaptersTable').on('click', 'tbody tr[role="row"]', function() {
              $('tbody')
                .find('tr')
                .css('background-color', '');
              $(this).css('background-color', '#FFFFC4');
              $scope.currId = $(this)
                .find('div#chapter-row-data')
                .data('key');
              $scope.currChapterName = $(this)
                .find('.tdCName')
                .text();
              $scope.currRegion = $(this)
                .find('.tdSelectRegion')
                .text();
              $scope.currState = $(this)
                .find('.tdSelectState')
                .text();
              $('#chapterDeleteBtn').removeClass('disabled');
            });

            // Clear selected value when user paginates
            $('#chaptersTable_paginate').off('click');
            $('#chaptersTable_paginate').on('click', function() {
              $('tbody')
                .find('tr')
                .css('background-color', '');
              $('#chapterDeleteBtn').addClass('disabled');
            });

            // Edit Chapter Name
            $('#chaptersTable .tdCName a').editable({
              type: 'text',
              name: 'Chapter Name',
              placement: 'bottom',
              emptytext: 'none',
              validate: function(value) {
                if ($.trim(value) == '') {
                  return 'Invalid Entry';
                }
              },
              url: function(params) {
                // There always needs to be a default chapter....
                if ($scope.currId === '-KvEej0qnrUczGhOxi5H') {
                  swal(
                    'Error',
                    'you cannot change this chapter name...',
                    'warning'
                  );
                  return;
                }

                var users_on_chapter = commonServices.queryChapterkey(
                  $scope.currId
                );

                $q.all([users_on_chapter]).then(function(data) {
                  // Update each user who has this chapter set to primary.
                  _.each(data[0], function(value, key) {
                    console.log(key);
                    console.log(value);
                    var path = 'userData/' + key + '/Chapter';
                    var packet = {
                      key: value.Chapter.key,
                      region: value.Chapter.region,
                      text: params.value,
                      value: params.value,
                    };
                    commonServices.updateData(path, packet);
                  });

                  // Update Chapter data in Regions node, and siteData node.
                  var path1 =
                    'Regions/' +
                    $scope.currRegion +
                    '/' +
                    $scope.currState +
                    '/' +
                    $scope.currId +
                    '/name';
                  var path2 = 'siteData/chapters/' + $scope.currId;
                  var packet1 = params.value;
                  var packet2 = {
                    region: $scope.currRegion,
                    text: params.value,
                    value: params.value,
                  };
                  commonServices.updateData(path1, packet1);
                  commonServices.updateData(path2, packet2);
                });
              },
            });
            // Edit Chapter Description
            $('#chaptersTable .tdDescription a').editable({
              type: 'text',
              name: 'Chapter Description',
              placement: 'bottom',
              emptytext: 'none',
              validate: function(value) {
                if ($.trim(value) == '') {
                  return 'Invalid Entry';
                }
              },
              url: function(params) {
                var path =
                  'Regions/' +
                  $scope.currRegion +
                  '/' +
                  $scope.currState +
                  '/' +
                  $scope.currId +
                  '/description';
                var packet = params.value;
                commonServices.updateData(path, packet);
              },
            });
            // Edit Chapter Admin
            $('#chaptersTable .tdChapterAdmin a').editable({
              type: 'text',
              name: 'Chapter Admin',
              placement: 'bottom',
              emptytext: 'none',
              validate: function(value) {
                if ($.trim(value) == '') {
                  return 'Invalid Entry';
                }
              },
              url: function(params) {
                var path =
                  'Regions/' +
                  $scope.currRegion +
                  '/' +
                  $scope.currState +
                  '/' +
                  $scope.currId +
                  '/lead';
                var packet = params.value;
                commonServices.updateData(path, packet);
              },
            });
          },
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
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/chapterAdd.html',
        controller: 'ChapterAddCtrl',
      });
    };

    $scope.removeChapter = function() {
      if ($scope.currId === '-KvEej0qnrUczGhOxi5H') {
        swal('Error', 'you cannot delete this chapter...', 'warning');
        return;
      }

      swal({
        title: 'Warning',
        text:
          'You are about to delete ' +
          $scope.currChapterName +
          '! If you wish to continue please type "DELETE" and press submit to continue.',
        input: 'text',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Submit',
      }).then(function(userAnwser) {
        if (userAnwser && userAnwser === 'DELETE') {
          var users_on_chapter = commonServices.queryChapterkey($scope.currId);
          $q.all([users_on_chapter]).then(function(data) {
            // Update each user who has this chapter set to primary.
            _.each(data[0], function(value, key) {
              var path = 'userData/' + key + '/Chapter';
              var packet = {
                // FILLER CHAPTER.
                key: '-KvEej0qnrUczGhOxi5H',
                region: 'Southwest Region',
                text: 'CHAPTER DELETED',
                value: 'CHAPTER DELETED',
              };
              commonServices.updateData(path, packet);
            });

            // Delete from Regions node
            commonServices.removeData(
              'Regions/' +
                $scope.currRegion +
                '/' +
                $scope.currState +
                '/' +
                $scope.currId
            );

            // Delete from Chat
            commonServices.removeData('chat/chapters/' + $scope.currId);

            // Delete from siteData
            commonServices.removeData('siteData/chapters/' + $scope.currId);

            swal(
              'Success!',
              'You have DELETED chapter, ' + $scope.currChapterName,
              'success'
            );

            $scope.update();
          });
        }
      });
    };
  });
