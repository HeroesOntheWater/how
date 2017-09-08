'use strict';

/**
 * @ngdoc function
 * @name ohanaApp.controller:ExpenseViewexpenseCtrl
 * @description
 * # ExpenseViewexpenseCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('ViewExpenseController', function(
    $scope,
    userService,
    $timeout,
    $filter,
    $uibModal,
    expenseservice,
    commonServices,
    $q,
    $location
  ) {
    $scope.lists = {};

    $scope.userRole = userService.getRole();
    $scope.userName = userService.getUserData();
    $scope.userChapter = userService.getChapter();
    $scope.userEmail = commonServices.getCurrentUserEmail();


    var currentDate = new Date();
    // Getting Expense Configuration value
    //Initial Config Load

    //Over Age Expense Config settings
    $scope.checkedOverageDays = function() {
      $scope.expenseConfig = [];
      $scope.editstatus = [];

      commonServices.getData('/Config/Expense').then(function(data) {
        if (data) {
          $scope.expenseConfig = data;

          // wtf?
          for (var x = 0; x < $scope.expenseConfig.length; x++) {
            if (
              Date.parse(currentDate) >=
                Date.parse($scope.expenseConfig[x].startdate) &&
              Date.parse(currentDate) <=
                Date.parse($scope.expenseConfig[x].enddate)
            ) {
              $scope.OverAgeWarning = $scope.expenseConfig[x].OverAgeWarning;
              $scope.OverAgeError = $scope.expenseConfig[x].OverAgeError;
              $scope.OverAgeDays = $scope.expenseConfig[x].OverAgeDays;
            }
          }

          //Get EDIT expense record info
          $scope.editExpenseList = expenseservice.getEditStatusrec();
          $scope.isEditExist = 'false';
          var pastdue = 0;
          $scope.$apply(function() {});
          $scope.editExpenseList.$loaded().then(function() {
            angular.forEach($scope.editExpenseList, function(list) {
              if (
                list.email == $scope.userEmail &&
                $scope.isEditExist == 'false'
              ) {
                $timeout(function() {
                  $scope.isEditExist = 'true';
                  $scope.editeventdate = list.eventdate;
                  //Set the Over Age days message
                  $scope.daysforoverage = 0;
                  pastdue = 0;
                  pastdue = expenseservice.getPastDue(list.eventdate);
                  if (pastdue < $scope.OverAgeDays) {
                    $scope.daysforoverage = $scope.OverAgeDays - pastdue; 
                  }

                  if (pastdue == $scope.OverAgeDays) {
                    $scope.daysforoverage = 0; 
                  }
                  if (pastdue > $scope.OverAgeDays) {
                    $scope.daysforoverage = pastdue - $scope.OverAgeDays;
                  }
                  $scope.editstatus.push({
                    OverAge: $scope.daysforoverage,
                    BillId: list.BillId,
                    EmailID: list.email,
                  });

                  if ($scope.daysforoverage !== undefined) {
                    if ($scope.daysforoverage > 0) {
                      swal(
                        'Expense waiting for submission! Over Age in ' +
                          $scope.daysforoverage +
                          ' days',
                        '',
                        ''
                      );
                    } else if ($scope.daysforoverage == 0) {
                      swal(
                        'Expense waiting for submission! Over Age TODAY',
                        '',
                        ''
                      );
                    } else {
                      swal('Expense in EDIT status Over Aged ', '', '');
                    }
                  }
                }, 0);
              }
            });
          });
          // console.log
          'list out', $scope.userEmail, $scope.isEditExist;
        }
      });
    };
    //Go to New Expense Page - EDIT status checked first
    $scope.neweexpense = function() {
      $scope.editExpenseList = expenseservice.getEditStatusrec();

      $scope.isEditExist = 'false';
      $scope.editExpenseList.$loaded().then(function() {
        angular.forEach($scope.editExpenseList, function(list) {
          // console.log("list ", list)

          if (list.email == $scope.userEmail && $scope.isEditExist == 'false') {
            $scope.isEditExist = 'true';
          }
        });

        if ($scope.isEditExist == 'true') {
          swal(
            'You cant create new expense',
            'Previous expense must be submitted',
            'warning'
          );
        } else {
          $location.path('/expense/newexpense');
        }
      });
    };

    //pop dash
    $scope.showPopover = function() {
      $scope.popoverIsVisible = true;
    };

    $scope.hidePopover = function() {
      $scope.popoverIsVisible = false;
    };

    $scope.openExpenseDash = function() {
      $scope.GetQuickOverviewData();
      $scope.$modalInstance = $uibModal.open({
        scope: $scope,
        templateUrl: 'myModalContent.html',
        size: 'dash',
      });
    };

    $scope.ok = function() {
      $scope.$modalInstance.close();
    };

    //Pie Chart Label option setting
    $scope.options = {
      legend: {
        display: true,
        position: 'bottom',
      },
    };

    //Filter the list on expense in EDIT status
    $scope.Showmeedit = function(BillId) {
      $location.path('/expense/expensedetail/' + BillId);
    };
    
    $scope.DateRangelist = [
      {
        name: 'Past Week',
        value: 'Past Week',
      },
      {
        name: 'Past Month',
        value: 'Past Month',
      },
      {
        name: 'Past 3 Month',
        value: 'Past 3 Month',
      },
      {
        name: 'Past Year',
        value: 'Past Year',
      },
      {
        name: 'Custom Range',
        value: 'Custom Range',
      },
    ];
    $scope.DateFilter = $scope.DateRangelist[2];

    var firstday = new Date(currentDate - 1000 * 60 * 60 * 24 * 90);
    $scope.startdate = new Date(currentDate - 1000 * 60 * 60 * 24 * 90);
    $scope.disp_startdate =
      $scope.startdate.getMonth() +
      1 +
      '/' +
      +$scope.startdate.getDate() +
      '/' +
      $scope.startdate.getFullYear();
    $scope.disp_enddate =
      currentDate.getMonth() +
      1 +
      '/' +
      currentDate.getDate() +
      '/' +
      currentDate.getFullYear();

    // $scope.startdate = new Date(currentDate - (1000 * 60 * 60 * 24 * 90));
    $scope.enddate = currentDate;
    $scope.disp_filterdate =
      $scope.disp_startdate + ' - ' + $scope.disp_enddate;

    //Date Filter Change
    $scope.DateFilterChange = function() {
      switch ($scope.DateFilter.value) {
        case 'Past Week':
          var currentDate = new Date();
          $scope.startdate = new Date(currentDate - 1000 * 60 * 60 * 24 * 7);
          $scope.enddate = currentDate;
          $scope.disp_startdate =
            $scope.startdate.getMonth() +
            1 +
            '/' +
            +$scope.startdate.getDate() +
            '/' +
            $scope.startdate.getFullYear();
          $scope.disp_enddate =
            currentDate.getMonth() +
            1 +
            '/' +
            currentDate.getDate() +
            '/' +
            currentDate.getFullYear();
          $scope.disp_filterdate =
            $scope.disp_startdate + ' - ' + $scope.disp_enddate;
          $scope.ExpenseSearch('normal');
          break;

        case 'Past Month':
          var currentDate = new Date();
          $scope.startdate = new Date(currentDate - 1000 * 60 * 60 * 24 * 30);
          $scope.enddate = currentDate;
          $scope.disp_startdate =
            $scope.startdate.getMonth() +
            1 +
            '/' +
            +$scope.startdate.getDate() +
            '/' +
            $scope.startdate.getFullYear();
          $scope.disp_enddate =
            currentDate.getMonth() +
            1 +
            '/' +
            currentDate.getDate() +
            '/' +
            currentDate.getFullYear();
          $scope.disp_filterdate =
            $scope.disp_startdate + ' - ' + $scope.disp_enddate;
          $scope.ExpenseSearch('normal');
          break;

        case 'Past 3 Month':
          var currentDate = new Date();
          $scope.startdate = new Date(currentDate - 1000 * 60 * 60 * 24 * 90);
          $scope.enddate = currentDate;
          $scope.disp_startdate =
            $scope.startdate.getMonth() +
            1 +
            '/' +
            +$scope.startdate.getDate() +
            '/' +
            $scope.startdate.getFullYear();
          $scope.disp_enddate =
            currentDate.getMonth() +
            1 +
            '/' +
            currentDate.getDate() +
            '/' +
            currentDate.getFullYear();
          $scope.disp_filterdate =
            $scope.disp_startdate + ' - ' + $scope.disp_enddate;
          $scope.ExpenseSearch('normal');
          break;

        case 'Past Year':
          var currentDate = new Date();
          $scope.startdate = new Date(currentDate - 1000 * 60 * 60 * 24 * 365);

          $scope.enddate = currentDate;
          $scope.disp_startdate =
            $scope.startdate.getMonth() +
            1 +
            '/' +
            +$scope.startdate.getDate() +
            '/' +
            $scope.startdate.getFullYear();
          $scope.disp_enddate =
            currentDate.getMonth() +
            1 +
            '/' +
            currentDate.getDate() +
            '/' +
            currentDate.getFullYear();
          $scope.disp_filterdate =
            $scope.disp_startdate + ' - ' + $scope.disp_enddate;
          $scope.ExpenseSearch('normal');
          break;

        case 'Custom Range':
          $scope.disp_startdate = '';
          $scope.disp_enddate = '';
          $scope.disp_filterdate = '';
          break;

        default:
          break;
      }
    };

    var LoggedUser =
      $scope.userName.name.first + ' ' + $scope.userName.name.last;

    switch ($scope.userRole) {
      case 'Volunteer':
      case 'Participant':
        $scope.HeadTitle = ' created by ' + LoggedUser;
        $scope.paystatuslist = [
          {
            name: 'All',
            value: '',
          },
          {
            name: 'Edit',
            value: 'Edit',
          },
          {
            name: 'Pending',
            value: 'Pending',
          },
          {
            name: 'Submitted',
            value: 'Submitted',
          },
          {
            name: 'Resubmit',
            value: 'Resubmit',
          },
          {
            name: 'Paid',
            value: 'Paid',
          },
          {
            name: 'Over Age',
            value: 'Over Age',
          },
        ];
        $scope.PayStatus = $scope.paystatuslist[4];
        break;

      case 'Chapter Lead':
        $scope.HeadTitle = ' for ' + $scope.userChapter.text;
        $scope.paystatuslist = [
          {
            name: 'All',
            value: '',
          },
          {
            name: 'Edit',
            value: 'Edit',
          },
          {
            name: 'Pending',
            value: 'Pending',
          },
          {
            name: 'Submitted',
            value: 'Submitted',
          },
          {
            name: 'Resubmit',
            value: 'Resubmit',
          },
          {
            name: 'Returned',
            value: 'Returned',
          },
          {
            name: 'Paid',
            value: 'Paid',
          },
          {
            name: 'Over Age',
            value: 'Over Age',
          },
        ];
        $scope.PayStatus = $scope.paystatuslist[5];
        break;

      default:
        $scope.paystatuslist = [
          {
            name: 'All',
            value: '',
          },
          {
            name: 'Edit',
            value: 'Edit',
          },
          {
            name: 'Pending',
            value: 'Pending',
          },
          {
            name: 'Submitted',
            value: 'Submitted',
          },
          {
            name: 'Resubmit',
            value: 'Resubmit',
          },
          {
            name: 'Returned',
            value: 'Returned',
          },
          {
            name: 'Paid',
            value: 'Paid',
          },
          {
            name: 'Over Age',
            value: 'Over Age',
          },
        ];
        $scope.PayStatus = $scope.paystatuslist[3];
    }

    //------------UI Bootstrap Date -----START--------------//

    $scope.today = function() {
      $scope.startdate = firstday;
      $scope.enddate = currentDate;
    };

    $scope.today();

    $scope.dateopen = function() {
      $scope.popup.opened = true;
      $scope.disp_startdate =
        $scope.startdate.getMonth() +
        1 +
        '/' +
        +$scope.startdate.getDate() +
        '/' +
        $scope.startdate.getFullYear();
      $scope.$applyAsync();
    };

    $scope.dateopen1 = function() {
      $scope.popup1.opened = true;
      $scope.disp_enddate =
        $scope.enddate.getMonth() +
        1 +
        '/' +
        $scope.enddate.getDate() +
        '/' +
        $scope.enddate.getFullYear();
      $scope.$applyAsync();
    };

    $scope.clear = function() {
      $scope.startdate = new Date(currentDate.getFullYear(), 0, 1);
      $scope.enddate = currentDate;
    };

    $scope.dateOptions = {
      'year-format': "'yyyy'",
      'starting-day': 1,
    };

    $scope.popup = {
      opened: false,
    };
    $scope.popup1 = {
      opened: false,
    };

    $scope.formats = ['MM/dd/yyyy'];
    $scope.format = $scope.formats[0];
    //
    function disabled(data) {
      var date = data.date,
        mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.ctrldate = {
      datetime: null,
    };

    //------------UI Bootstrap Date -----END--------------//
    //----Past Due - Expense list function -------Start -----------//
    $scope.filterPastDue = function() {
      $scope.startdate = new Date(currentDate.getFullYear() - 5, 0, 1);
      $scope.enddate = new Date(currentDate - 1000 * 60 * 60 * 24 * 30);
      //(1000 * 60 * 60 * 24 * 60) - 60 Day prior calculation

      switch ($scope.userRole) {
        case 'Volunteer':
        case 'Participant':
          $scope.PayStatus = $scope.paystatuslist[1];

          break;
        case 'Chapter Lead':
          $scope.PayStatus = $scope.paystatuslist[1];
          break;
        default:
          $scope.PayStatus = $scope.paystatuslist[2];
      }
      $scope.disp_startdate =
        $scope.startdate.getMonth() +
        1 +
        '/' +
        +$scope.startdate.getDate() +
        '/' +
        $scope.startdate.getFullYear();
      $scope.disp_enddate =
        $scope.enddate.getMonth() +
        1 +
        '/' +
        $scope.enddate.getDate() +
        '/' +
        $scope.enddate.getFullYear();
      // console.log($scope.userRole, $scope.PayStatus, $scope.startdate, $scope.enddate, $scope.disp_startdate, $scope.disp_enddate);
      $scope.DateFilter = $scope.DateRangelist[4];
      $scope.ExpenseSearch('Overdue');
    };

    //----Past Due - Expense list function -------END -----------//

    // View Expense entery point
    $scope.viewexpensedata = function() {
      $scope.checkedOverageDays();
      $scope.ExpenseSearch('normal');
    };

    $scope.ExpenseSearch = function() {
      // console.log("SEARCH - ", $scope.userEmail, $scope.userRole, $scope.userChapter, $scope.startdate, $scope.enddate, $scope.PayStatus.value);
      $scope.lists = expenseservice.getViewExpenseData(
        $scope.userEmail,
        $scope.userRole,
        $scope.userChapter
      );
      $scope.$applyAsync();
      // console.log("expense sear", $scope.lists);
      $scope.buildExpenseDataTable(
        $scope.lists,
        $scope.userRole,
        $scope.startdate,
        $scope.enddate,
        $scope.PayStatus.value,
        
      );
    };

    //Build Data Table for viewing expense
    $scope.buildExpenseDataTable = function(
      viewExpenseList,
      userRole,
      startdate,
      enddate,
      paystatus,
      
    ) {
      var currentDate = new Date();
      var expensearray = [];
      $scope.selectedbills = [];
      $scope.selectedbills.length = 0;

      // viewExpenseList.$loaded(function(list) {
      // console.log("Build", viewExpenseList);
      viewExpenseList
        .$loaded()
        .then(function(list) {
          expensearray = [];
          expensearray.length = 0;

          // console.log("key ", list, list.length, expensearray);
          for (var i = 0; i < list.length; i++) {
            var pastdue = 0;
            // get current date with 12AM .setHours(0, 0, 0, 0)
            if (
              list[i].PaymentStatus != 'Paid' &&
              list[i].PaymentStatus != 'Over Age'
            ) {
              pastdue = expenseservice.getPastDue(list[i].eventdate);
            } else pastdue = '';

            // if ( == 'edit' && list[i].PaymentStatus == 'Edit') {
            //     // && list[i].PaymentStatus != 'Over Age') {

            //     expensearray.push({
            //         "SubmitDate": list[i].SubmitDate,
            //         "SubmitBy": list[i].SubmitBy,
            //         "eventdate": list[i].eventdate,
            //         "Chapter": list[i].Chapter,
            //         "Amount": list[i].Amount,
            //         "PaymentStatus": list[i].PaymentStatus,
            //         "pastdue": pastdue,
            //         "BillId": list[i].BillId
            //     });
            //     // console.log("Edit - ", expensearray, , list[i].PaymentStatus);
            // } else {
            //     if ( != 'edit') {
            expensearray.push({
              SubmitDate: list[i].SubmitDate,
              SubmitBy: list[i].SubmitBy,
              eventdate: list[i].eventdate,
              Chapter: list[i].Chapter,
              Amount: list[i].Amount,
              PaymentStatus: list[i].PaymentStatus,
              pastdue: pastdue,
              BillId: list[i].BillId,
            });
            // console.log("Non-Edit - ", expensearray, , list[i].PaymentStatus);
            // }
            // }
          }

          //date filter
          var retArray = [];
          retArray.length = 0;
          if (expensearray != null && startdate != null && enddate != null) {
            angular.forEach(expensearray, function(obj) {
              var receivedDate = obj.eventdate; // filter is based on Event Date not on Submit Date .SubmitDate;

              if (
                Date.parse(receivedDate) >= Date.parse(startdate) &&
                Date.parse(receivedDate) <= Date.parse(enddate)
              ) {
                retArray.push(obj);
                // console.log("Date ", Date.parse(receivedDate), receivedDate, startdate, enddate, retArray);
              }
            });
          }
          // console.log("Pay Status Array 1 ", retArray, $scope.retResults);
          $scope.retResults = [];
          $scope.retResults.length = 0;
          if (paystatus != null && retArray != null && paystatus != '') {
            angular.forEach(retArray, function(obj) {
              var tpaystatus = obj.PaymentStatus;

              if (tpaystatus == paystatus) {
                $scope.retResults.push(obj);
                // console.log("paystatus ", retArray, retResults, paystatus, tpaystatus);
              }
            });
          } else {
            $scope.retResults = retArray;
          }
          // console.log("Pay Status Array 2 ", retArray, $scope.retResults);

          angular.element(document).ready(function() {
            //toggle `popup` / `inline` mode
            $.fn.editable.defaults.mode = 'popup';
            $.fn.editable.defaults.ajaxOptions = {
              type: 'PUT',
            };
            //if exists, destroy instance of table
            if ($.fn.DataTable.isDataTable($('#expenseTable'))) {
              // $('#expenseTable').DataTable().destroy();
              $scope.expenseTable.destroy();
            }
            // var selected = [];
            $scope.expenseTable = $('#expenseTable').DataTable({
              responsive: true,
              autoWidth: false,
              data: $scope.retResults,
              // select: {
              //     style: 'single',
              //     selector: ':not(td:first-child)'
              // },

              fnRowCallback: function(
                nRow,
                data,
                iDisplayIndex,
                iDisplayIndexFull
              ) {
                if (
                  data.pastdue > parseInt($scope.OverAgeWarning) &&
                  data.pastdue < parseInt($scope.OverAgeError) &&
                  (data.PaymentStatus != 'Paid' &&
                    data.PaymentStatus != 'Over Age')
                ) {
                  $(nRow).css('color', 'red');
                }

                if (
                  data.pastdue > $scope.OverAgeError - 1 &&
                  (data.PaymentStatus != 'Paid' &&
                    data.PaymentStatus != 'Over Age')
                ) {
                  $(nRow).css('color', 'red');
                  $(nRow).css('font-weight', 'bold');
                  $(nRow).css('background-color', 'yellow');
                  $(nRow).css('font-size', '16px');
                }
              },
              pagingType: 'full_numbers',
              columns: [
                {
                  data: 'eventdate',
                  width: '60px',
                },
                {
                  data: 'Amount',
                  width: '60px',
                  render: $.fn.dataTable.render.number(',', '.', 2, '$'),
                },
                {
                  data: 'PaymentStatus',
                  width: '60px',
                },
                {
                  data: 'SubmitBy',
                  width: '60px',
                },
                {
                  data: 'Chapter.text',
                  width: '60px',
                },
                {
                  data: 'SubmitDate',
                  width: '50px',
                  visible: false,
                },
                {
                  data: 'pastdue',
                  width: '60px',
                },
              ],
              columnDefs: [
                {
                  targets: 0,
                },
                {
                  targets: 4,
                  visible: userRole == 'National Staff',
                },
                {
                  targets: 6,
                  width: '90px',
                },
              ],
              order: [[6, 'desc']],
              headerCallback: function(thead) {
                if (userRole == 'National Staff') {
                  // $(thead).find('th').eq(0).html('<input type="checkbox" id="expenseTable-select-all">');
                }
              },
            });

            $('#expenseTable')
              .dataTable()
              .yadcf([
                {
                  column_number: 3,
                  select_type: 'chosen',
                  filter_default_label: 'Expense Originator Name',
                },
                {
                  column_number: 4,
                  select_type: 'chosen',
                  filter_default_label: 'Chapter',
                },
                {
                  column_number: 5,
                  select_type: 'chosen',
                  filter_default_label: 'Submit Date',
                },

                {
                  column_number: 0,
                  select_type: 'chosen',
                  filter_default_label: 'Event Date',
                },
                {
                  column_number: 1,
                  select_type: 'chosen',
                  filter_default_label: 'Amount',
                },
                {
                  column_number: 2,
                  select_type: 'chosen',
                  filter_default_label: 'Payment Status',
                },
                {
                  column_number: 6,
                  select_type: 'chosen',
                  filter_default_label: 'Past Due',
                },
              ]);

            // var table = $('#expenseTable').DataTable();

            $('#example tbody').off('click', 'tr');

            $('#expenseTable tbody').on('click', 'tr', function() {
              // console.log("Pay Status Array 3 ", retArray, $scope.retResults);
              var data = $scope.expenseTable.row(this).data();
              // alert('You clicked on ' + data.BillId);
              window.location = '#/expense/expensedetail/' + data.BillId;
            });
          });
        })
        .catch(function(error) {
          console.error('error', error);
        });
    };

    // $scope.ViewSelectedRow = function() {
    //     var StatusChangedBy = $scope.userName.name.first + ' ' + $scope.userName.name.last;
    //     expenseservice.updatePaymentStatus($scope.selectedbills, StatusChangedBy);
    //     // console.log("button clicked", $scope.selectedbills);
    //     $scope.ExpenseSearch("normal");
    // };

    //Get Quick Over view Data - Pie Chart and Table Data
    $scope.GetQuickOverviewData = function() {
      $scope.dashlist = expenseservice.getViewExpenseData(
        $scope.userEmail,
        $scope.userRole,
        $scope.userChapter
      );
      // $scope.$applyAsync();

      $scope.expensedash = [];
      $scope.expensedash.length = 0;
      $scope.pielabels = [];
      $scope.pielabels.length = 0;
      $scope.piedata = [];
      $scope.piedata.length = 0;
      $scope.piecolor = [];
      $scope.piecolor.length = 0;
      $scope.PieDisplay = '';

      var apaid = 0;
      var apending = 0;
      var asubmitted = 0;
      var aresubmit = 0;
      var areturned = 0;
      var aoverage = 0;
      var apaid = 0;
      var aedit = 0;
      var pastdue = 0;
      var editbillid = '';
      var emailid = '';
      // var daysforoverage = 0;
      // $scope.piedata = [apending, aedit, asubmitted, areturned, aresubmit, apaid, aoverage];
      $scope.dashlist.$loaded().then(function() {
        angular.forEach($scope.dashlist, function(list) {
          switch (list.PaymentStatus) {
            case 'Paid':
              apaid = apaid + 1;
              break;
            case 'Edit':
              aedit = aedit + 1;
              break;
            case 'Over Age':
              aoverage = aoverage + 1;
              break;
            case 'Pending':
              apending = apending + 1;
              break;

            case 'Returned':
              areturned = areturned + 1;
              break;
            case 'Resubmit':
              aresubmit = aresubmit + 1;
              break;
            case 'Submitted':
              asubmitted = asubmitted + 1;
              break;
          }
        });

        $scope.TotalExpenseCount =
          apending +
          aedit +
          asubmitted +
          areturned +
          aresubmit +
          apaid +
          aoverage;

        if (apending > 0) {
          $scope.piedata.push(apending);
          $scope.pielabels.push('Pending');
          $scope.piecolor.push('#FFA500');
          $scope.expensedash.push({
            Label: 'Pending',
            Data: apending,
          });
        }

        if (aedit > 0) {
          $scope.piedata.push(aedit);
          $scope.pielabels.push('Edit');
          $scope.piecolor.push('#FF6347');
          // if (pastdue < 60) {
          //     daysforoverage = 60 - pastdue;
          // }

          $scope.expensedash.push({
            Label: 'Edit',
            Data: aedit,
          });
        }

        if (asubmitted > 0) {
          $scope.piedata.push(asubmitted);
          $scope.pielabels.push('Submitted');
          $scope.piecolor.push('#0816ff');
          $scope.expensedash.push({
            Label: 'Submitted',
            Data: asubmitted,
          });
        }

        if (areturned > 0) {
          $scope.piedata.push(areturned);
          $scope.pielabels.push('Returned');
          $scope.piecolor.push('#08ffff');
          $scope.expensedash.push({
            Label: 'Returned',
            Data: areturned,
          });
        }

        if (aresubmit > 0) {
          $scope.piedata.push(aresubmit);
          $scope.pielabels.push('Resubmit');
          $scope.piecolor.push('#08ffff');
          $scope.expensedash.push({
            Label: 'Resubmit',
            Data: aresubmit,
          });
        }

        if (apaid > 0) {
          $scope.piedata.push(apaid);
          $scope.pielabels.push('Paid');
          $scope.piecolor.push('#08ff21');
          $scope.expensedash.push({
            Label: 'Paid',
            Data: apaid,
          });
        }

        if (aoverage > 0) {
          $scope.piedata.push(aoverage);
          $scope.pielabels.push('Over Age');
          $scope.piecolor.push('#FF0000');
          $scope.expensedash.push({
            Label: 'Over Age',
            Data: aoverage,
          });
        }
      });

      // console.log("Dash -222", $scope.editstatus, $scope.dashlist, $scope.piecolor, $scope.pielabels, $scope.piedata);
      // if ($scope.expensedash !== undefined) {
    };

    // var rptdata = [];
    var currentDate = new Date();
    var reportDate =
      currentDate.getMonth() +
      1 +
      '/' +
      currentDate.getDate() +
      '/' +
      currentDate.getFullYear();

    var GetTableData;

    //Get Report Data - Data fileterd based on Dropdown/Date value

    var GetJsonData = function() {
      var rptdata = [];
      var userEmail = commonServices.getCurrentUserEmail();
      // $scope.userRole = $rootScope.userRole;
      // $scope.userName = $rootScope.userName;
      // $scope.userChapter = $rootScope.userChapter;
      angular.forEach($scope.lists, function(value, index) {
        for (var i = 0; i < value.length; i++) {
          // console.log("first list length", $scope.listS.length);
          //$scope.listS === value[i].Chapter || $scope.listS === "") &&

          // console.log("first check - ", value[i].PaymentStatus, $scope.PayStatus.value);
          // console.log("second check - ", Date.parse(value[i].SubmitDate), Date.parse($scope.startdate), Date.parse($scope.enddate));
          // console.log("third check - ", $scope.userRole, value[i].email, userEmail);

          if (
            (value[i].PaymentStatus == $scope.PayStatus.value ||
              $scope.PayStatus.value == '') &&
            (Date.parse(value[i].SubmitDate) >= Date.parse($scope.startdate) &&
              Date.parse(value[i].SubmitDate) <= Date.parse($scope.enddate)) &&
            (($scope.userRole == 'Participant' ||
              $scope.userRole == 'Volunteer') &&
              value[i].email == userEmail)
          ) {
            var reportdata = {
              Date: value[i].eventdate,
              'Business Purpose, Origin & Destination': value[i].Description,
              'Miles Driven': parseInt(value[i].Line[0].Quantity),
              'Travel @ .25/mile': numberWithCommas(
                Math.round(parseFloat(value[i].Line[0].Amount) * 100) / 100
              ),
              'Trailer Miles': parseInt(value[i].Line[1].Quantity),
              'Trailer Hauling @ .40/mile': numberWithCommas(
                Math.round(parseFloat(value[i].Line[1].Amount) * 100) / 100
              ),
              'Other Expenses': numberWithCommas(
                Math.round(parseFloat(value[i].Line[2].Amount) * 100) / 100
              ),
              Total: numberWithCommas(
                Math.round(parseFloat(value[i].Amount) * 100) / 100
              ),
              'Explanation of Other Expense': value[i].Line[2].Description,
            };

            rptdata.push(reportdata);
          }

          if (
            (value[i].PaymentStatus == $scope.PayStatus.value ||
              $scope.PayStatus.value == '') &&
            (Date.parse(value[i].SubmitDate) >= Date.parse($scope.startdate) &&
              Date.parse(value[i].SubmitDate) <= Date.parse($scope.enddate)) &&
            ($scope.userRole == 'Chapter Lead' &&
              $scope.userChapter.text == value[i].Chapter.text)
          ) {
            var reportdata = {
              Date: value[i].eventdate,
              'Business Purpose, Origin & Destination': value[i].Description,
              'Miles Driven': parseInt(value[i].Line[0].Quantity),
              'Travel @ .25/mile': numberWithCommas(
                Math.round(parseFloat(value[i].Line[0].Amount) * 100) / 100
              ),
              'Trailer Miles': parseInt(value[i].Line[1].Quantity),
              'Trailer Hauling @ .40/mile': numberWithCommas(
                Math.round(parseFloat(value[i].Line[1].Amount) * 100) / 100
              ),
              'Other Expenses': numberWithCommas(
                Math.round(parseFloat(value[i].Line[2].Amount) * 100) / 100
              ),
              Total: numberWithCommas(
                Math.round(parseFloat(value[i].Amount) * 100) / 100
              ),
              'Explanation of Other Expense': value[i].Line[2].Description,
            };

            rptdata.push(reportdata);
          }

          if (
            (value[i].PaymentStatus == $scope.PayStatus.value ||
              $scope.PayStatus.value == '') &&
            (Date.parse(value[i].SubmitDate) >= Date.parse($scope.startdate) &&
              Date.parse(value[i].SubmitDate) <= Date.parse($scope.enddate)) &&
            $scope.userRole == 'National Staff'
          ) {
            var reportdata = {
              Date: value[i].eventdate,
              'Business Purpose, Origin & Destination': value[i].Description,
              'Miles Driven': parseInt(value[i].Line[0].Quantity),
              'Travel @ .25/mile': numberWithCommas(
                Math.round(parseFloat(value[i].Line[0].Amount) * 100) / 100
              ),
              'Trailer Miles': parseInt(value[i].Line[1].Quantity),
              'Trailer Hauling @ .40/mile': numberWithCommas(
                Math.round(parseFloat(value[i].Line[1].Amount) * 100) / 100
              ),
              'Other Expenses': numberWithCommas(
                Math.round(parseFloat(value[i].Line[2].Amount) * 100) / 100
              ),
              Total: numberWithCommas(
                Math.round(parseFloat(value[i].Amount) * 100) / 100
              ),
              'Explanation of Other Expense': value[i].Line[2].Description,
            };

            rptdata.push(reportdata);
          }

          console.log('report', i, rptdata);
        } //for loop
      }); //for each

      return rptdata;
    };

    // Create PDF Report
    $scope.CreateExpenseReport = function() {
      var t = 0;

      //Get Report Data - Data fileterd based on Dropdown/Date value
      $scope.ExpenseSearch('normal'); //populate $scope.lists data
      // console.log("Get Report Data", $scope.lists, $scope.startdate, $scope.enddate);
      var currentDate = new Date();
      var reportDate =
        currentDate.getMonth() +
        1 +
        '/' +
        currentDate.getDate() +
        '/' +
        currentDate.getFullYear();
      var Chaptername = $scope.userChapter.text;
      var sdate =
        $scope.startdate.getMonth() +
        1 +
        '/' +
        $scope.startdate.getDate() +
        '/' +
        $scope.startdate.getFullYear();
      var edate =
        $scope.enddate.getMonth() +
        1 +
        '/' +
        $scope.enddate.getDate() +
        '/' +
        $scope.enddate.getFullYear();
      var email = commonServices.getCurrentUserEmail();
      var name = $scope.userName.name.first + ' ' + $scope.userName.name.last;
      var address =
        $scope.userName.address.line1 + ' , ' + $scope.userName.address.line2;
      var cityinfo =
        $scope.userName.address.city +
        ' , ' +
        $scope.userName.address.state +
        ' , ' +
        $scope.userName.address.zip;

      $scope.rptdata = [];

      var userEmail = commonServices.getCurrentUserEmail();

      $scope.lists.$loaded().then(function(value) {
        for (var i = 0; i < value.length; i++) {
          // console.log("first check - ", value[i].PaymentStatus, $scope.PayStatus.value);
          // console.log("second check - ", Date.parse(value[i].SubmitDate), Date.parse($scope.startdate), Date.parse($scope.enddate));
          // console.log("third check - ", $scope.userRole, value[i].email, userEmail);

          if (
            (value[i].PaymentStatus == $scope.PayStatus.value ||
              $scope.PayStatus.value == '') &&
            (Date.parse(value[i].SubmitDate) >= Date.parse($scope.startdate) &&
              Date.parse(value[i].SubmitDate) <= Date.parse($scope.enddate)) &&
            (($scope.userRole == 'Participant' ||
              $scope.userRole == 'Volunteer') &&
              value[i].email == userEmail)
          ) {
            var reportdata = {
              'Event Date': value[i].eventdate,
              'Business Purpose, Origin & Destination': value[i].Description,
              'Miles Driven': parseInt(value[i].Line[0].Quantity),
              'Travel @ .25/mile':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[0].Amount) * 100) / 100
                ),
              'Trailer Miles': parseInt(value[i].Line[1].Quantity),
              'Trailer Hauling @ .40/mile':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[1].Amount) * 100) / 100
                ),
              'Other Expenses':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[2].Amount) * 100) / 100
                ),
              Total:
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Amount) * 100) / 100
                ),
              'Explanation of Other Expense': value[i].Line[2].Description,
            };

            $scope.rptdata.push(reportdata);
          }

          if (
            (value[i].PaymentStatus == $scope.PayStatus.value ||
              $scope.PayStatus.value == '') &&
            (Date.parse(value[i].SubmitDate) >= Date.parse($scope.startdate) &&
              Date.parse(value[i].SubmitDate) <= Date.parse($scope.enddate)) &&
            ($scope.userRole == 'Chapter Lead' &&
              $scope.userChapter.text == value[i].Chapter.text)
          ) {
            var reportdata = {
              'Event Date': value[i].eventdate,
              'Business Purpose, Origin & Destination': value[i].Description,
              'Miles Driven': parseInt(value[i].Line[0].Quantity),
              'Travel @ .25/mile':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[0].Amount) * 100) / 100
                ),
              'Trailer Miles': parseInt(value[i].Line[1].Quantity),
              'Trailer Hauling @ .40/mile':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[1].Amount) * 100) / 100
                ),
              'Other Expenses':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[2].Amount) * 100) / 100
                ),
              Total:
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Amount) * 100) / 100
                ),
              'Explanation of Other Expense': value[i].Line[2].Description,
            };

            $scope.rptdata.push(reportdata);
          }

          if (
            (value[i].PaymentStatus == $scope.PayStatus.value ||
              $scope.PayStatus.value == '') &&
            (Date.parse(value[i].SubmitDate) >= Date.parse($scope.startdate) &&
              Date.parse(value[i].SubmitDate) <= Date.parse($scope.enddate)) &&
            $scope.userRole == 'National Staff'
          ) {
            var reportdata = {
              'Event Date': value[i].eventdate,
              'Business Purpose, Origin & Destination': value[i].Description,
              'Miles Driven': parseInt(value[i].Line[0].Quantity),
              'Travel @ .25/mile':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[0].Amount) * 100) / 100
                ),
              'Trailer Miles': parseInt(value[i].Line[1].Quantity),
              'Trailer Hauling @ .40/mile':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[1].Amount) * 100) / 100
                ),
              'Other Expenses':
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Line[2].Amount) * 100) / 100
                ),
              Total:
                '$ ' +
                numberWithCommas(
                  Math.round(parseFloat(value[i].Amount) * 100) / 100
                ),
              'Explanation of Other Expense': value[i].Line[2].Description,
            };

            $scope.rptdata.push(reportdata);
          }

          // console.log("report - ", i, $scope.rptdata);
        } //for loop

        // console.log("report", $scope.rptdata);
        expenseservice.createPDFReport(
          $scope.rptdata,
          reportDate,
          name,
          address,
          cityinfo,
          Chaptername,
          email,
          sdate,
          edate
        );
      });
    };

    $scope.idSelectedBill = null;
    $scope.setSelected = function(idSelectedBill) {
      $scope.idSelectedBill = idSelectedBill;
      // alert("expense/expensedetail/" + $scope.idSelectedBill);
      // window.location = "#/expense/expensedetail/" + $scope.idSelectedBill;
      $location.path('/expense/expensedetail/' + $scope.idSelectedBill);

      // $location.path("#/expense/expensedetail/" + $scope.idSelectedBill);
    };
  });

function numberWithCommas(x) {
  var parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
