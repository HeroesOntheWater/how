'use strict';

/**
 * @ngdoc function
 * @name ohanaApp.controller:ExpenseExpenseconfigCtrl
 * @description
 * # ExpenseExpenseconfigCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('ExpenseExpenseconfigCtrl', function(
    $scope,
    commonServices,
    userService,
    $q,
    $location
  ) {
    $scope.ConfigLog = [];
    $scope.expenseconfig = [];
    $scope.ConfigLog.length = 0;
    $scope.expenseconfig.length = 0;
    $scope.expenseconfigdata = [];

    $scope.opened = {};

    $scope.open = function($event, elementOpened) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened[elementOpened] = !$scope.opened[elementOpened];
    };

    $scope.expenseconfig.startdate = new Date();
    $scope.expenseconfig.enddate = new Date();
    $scope.expenseconfig = [];
    $scope.expenseconfig.length = 0;

    $scope.saveConfig = function(data, id) {
      // check if date range is valid
      if (!$scope.isDateValid($scope.expenseconfig[id - 1])) {
        swal('Invalid', 'Date range is invalid!', 'warning');
      } else {
        $scope.expenseconfigdata.push({
          id: id,
          startdate: $scope.expenseconfig[id - 1].startdate,
          enddate: $scope.expenseconfig[id - 1].enddate,
          MileRate: $scope.expenseconfig[id - 1].MileRate,
          TrailerRate: $scope.expenseconfig[id - 1].TrailerRate,
          OverAgeWarning: $scope.expenseconfig[id - 1].OverAgeWarning,
          OverAgeError: $scope.expenseconfig[id - 1].OverAgeError,
          OverAgeDays: $scope.expenseconfig[id - 1].OverAgeDays,
        });

        $scope.expenseconfigdata.push(data);

        angular.extend(data, {
          id: id,
        });

        // $scope.expenseconfig = $scope.expenseconfigdata;
        $scope.updateconfigdata();
        console.log('save ', data, id, $scope.expenseconfigdata);
      }
    };

    // remove configuration - added confirm dialog
    $scope.removeConfig = function(index) {
      // store index to get around some silly scope issue
      var currIndex = index;
      swal({
        title: 'Confirm Delete?',
        text: 'Woud you like to delete this expense config?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it!',
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        allowOutsideClick: false,
        allowEscapeKey: false,
        buttonsStyling: false,
      }).then(function() {
        console.log(currIndex);
        $scope.expenseconfig.splice(index, 1);
        swal('Deleted!', 'Your config has been deleted.', 'success');
      });
      //update config list
      $scope.updateconfigdata(false);
    };

    // add config
    $scope.addConfig = function() {
      var recid = 0;

      if ($scope.expenseconfig !== undefined) {
        recid = $scope.expenseconfig.length + 1;
        $scope.inserted = {
          id: $scope.expenseconfig.length + 1,
          startdate: '',
          enddate: '',
          MileRate: 0,
          TrailerRate: 0,
          OverAgeWarning: 30,
          OverAgeError: 45,
          OverAgeDays: 60,
        };
      } else {
        console.log('emo');
        $scope.expenseconfig = [];
        $scope.inserted = {
          id: 1,
          startdate: '',
          enddate: '',
          MileRate: 0,
          TrailerRate: 0,
          OverAgeWarning: 0,
          OverAgeError: 0,
          OverAgeDays: 0,
        };
      }
      $scope.expenseconfig.push($scope.inserted);
    };

    //---------------

    //Initial Config Load

    function loadexpenseconfig() {
      $scope.expenseconfig = [];
      $scope.expenseconfig.length = 0;
      $scope.ConfigLog = [];
      $scope.ConfigLog.length = 0;
      console.log('Entry');
      commonServices
        .getData('/Config/')
        .then(function(data) {
          if (data) {
            $scope.ConfigLog = data.ExpenseLog;
            $scope.expenseconfig = data.Expense;
            $scope.$apply(function() {});
            $scope.buildConfigData();
            // console.log("Entry2", $scope.ConfigLog);
          } else {
            $scope.expenseconfig.push({
              id: 1,
              startdate: '',
              enddate: '',
              MileRate: 0,
              TrailerRate: 0,
              OverAgeWarning: 0,
              OverAgeError: 0,
              OverAgeDays: 0,
            });
            $scope.ConfigLog = [];
            console.log('Entry3');
          }
        })
        .catch(function(error) {
          console.log('Entry4');
          $scope.expenseconfig = [];
          $scope.ConfigLog = [];
        });

      // $scope.buildConfigData();
    }

    loadexpenseconfig();

    //function call to handle the "cancel" button on an edit config row
    // if dates are not set or invalid then remove this config
    $scope.cancel = function(index) {
      // check dates
      var currIndex = index.id - 1;
      // check if dates are valid, if not pop up alert that they will not be saved.
      $scope.expenseconfig.splice(currIndex, 1);
      $scope.updateconfigdata();
    };

    // check if date is valid
    $scope.isDateValid = function(expenseConfig) {
      var startDate = expenseConfig.startdate;
      var endDate = expenseConfig.enddate;
      // check if date is empty string or null
      if (
        startDate === '' ||
        endDate === '' ||
        startDate === null ||
        endDate === null
      ) {
        return false;
      }
      // check if start date is after end date
      // convert earlier objects to moment objects
      startDate = moment(expenseConfig.startDate);
      endDate = moment(expenseConfig.enddate);
      if (startDate.isAfter(endDate)) {
        return false;
      }

      // more checks later

      return true;
    };

    //Go Back to View Expense Page
    $scope.GoBack = function() {
      $location.path('/expense/viewexpense');
    };

    $scope.updateconfigdata = function(showSwal) {
      $scope.userName = userService.getUserData();
      var StatusChangedBy =
        $scope.userName.name.first + ' ' + $scope.userName.name.last;

      var currentdate = new Date();
      var StatusChangedDate = '';
      if (currentdate.getHours() > 12) {
        StatusChangedDate =
          currentdate.getFullYear() +
          '-' +
          ('0' + (currentdate.getMonth() + 1)).slice(-2) +
          '-' +
          ('0' + currentdate.getDate()).slice(-2) +
          ' ' +
          ('0' + (currentdate.getHours() - 12)).slice(-2) +
          ':' +
          ('0' + currentdate.getMinutes()).slice(-2) +
          ':' +
          ('0' + currentdate.getSeconds()).slice(-2) +
          ' PM';
      } else {
        StatusChangedDate =
          currentdate.getFullYear() +
          '-' +
          ('0' + (currentdate.getMonth() + 1)).slice(-2) +
          '-' +
          ('0' + currentdate.getDate()).slice(-2) +
          ' ' +
          ('0' + currentdate.getHours()).slice(-2) +
          ':' +
          ('0' + currentdate.getMinutes()).slice(-2) +
          ':' +
          ('0' + currentdate.getSeconds()).slice(-2) +
          ' AM';
      }

      $scope.ConfigLog.push({
        StatusBy: StatusChangedBy,
        StatusDate: StatusChangedDate,
      });

      for (var x = 0; x < $scope.ConfigLog.length; x++) {
        if ($scope.ConfigLog[x] != null) {
          delete $scope.ConfigLog[x].$$hashKey;
        }
      }
      for (var x = 0; x < $scope.expenseconfig.length; x++) {
        if ($scope.expenseconfig[x] != null) {
          delete $scope.expenseconfig[x].$$hashKey;
        }
      }
      $scope.config = {
        Expense: $scope.expenseconfig,
        ExpenseLog: $scope.ConfigLog,
      };

      // This is to update configuration value
      commonServices.updateData('/Config/', $scope.config);
      // console.log("called", $scope.config);
      if (showSwal) {
        swal({
          text: 'Updated Expense Config',
          type: 'success',
          timer: 2500,
        });
      }
      loadexpenseconfig();
      $scope.buildConfigData();
    };

    //Build Expense Amount Data Table for viewing expense
    $scope.buildConfigData = function() {
      angular.element(document).ready(function() {
        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };
        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#ConfigStatusTable'))) {
          $scope.EVTable.destroy();
        }
        // var selected = [];
        $scope.EVTable = $('#ConfigStatusTable')
          .removeAttr('width')
          .DataTable({
            responsive: true,
            autoWidth: false,
            data: $scope.ConfigLog, // tabledata,
            scrollY: '200px',
            scrollCollapse: true,
            paging: false,

            columns: [
              {
                data: 'StatusDate',
                title: 'Status Date',
                width: '70px',
              },
              {
                data: 'StatusBy',
                title: 'Status By',
                width: '90px',
              },
            ],
            columnDefs: [
              {
                targets: 0,
                width: '25%',
              },
              {
                targets: 1,
                width: '35%',
              },
            ],
            order: [[0, 'desc']],
          });
      });
    };
  });
