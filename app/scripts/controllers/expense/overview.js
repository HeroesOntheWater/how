'use strict';

/**
 * @ngdoc function
 * @name ohanaApp.controller:ExpenseOverviewCtrl
 * @description
 * # ExpenseOverviewCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('ExpenseOverviewCtrl', function(
    $scope,
    $timeout,
    userService,
    expenseservice,
    commonServices,
    $window,
    $location,
    $q
  ) {
    $scope.userRole = userService.getRole();
    $scope.userName = userService.getUserData();
    $scope.userChapter = userService.getChapter();
    $scope.useremail = commonServices.getCurrentUserEmail();

    //Go  to View Expense Page
    $scope.ViewExpenseList = function() {
      window.location = '#/expense/viewexpense';
    };

    // New Expense
    //Go to New Expense Page - EDIT status checked first
    $scope.neweexpense = function() {
      if ($scope.iseditexist == 'true') {
        swal(
          'You cant create new expense',
          'Previous expense in EDIT status must be submitted',
          'warning'
        );
      } else {
        $location.path('/expense/newexpense');
      }
    };

    //Pie Chart Label option setting
    $scope.options = {
      legend: {
        display: true,
        position: 'bottom',
      },
    };

    $scope.options1 = {
      legend: {
        display: true,
        position: 'bottom',
      },
    };

    // get array of last 12 month
    $scope.labels1 = [];
    $scope.labels1.length = 0;
    $scope.labels1 = expenseservice.getlast12month();
    $scope.labels2 = expenseservice.getlast12monthyear();

    $scope.series1 = [];
    $scope.data1 = [];
    $scope.data2 = [];

    $scope.options1 = {
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'left',
          },
        ],
      },
    };

    // ---Check box
    // Fruits
    $scope.paystatuslist = [
      'Edit',
      'Pending',
      'Resubmit',
      'Submitted',
      'Returned',
      'Paid',
      'Over Age',
    ];

    // Selected fruits
    $scope.selectedpaystatus = [
      'Edit',
      'Pending',
      'Resubmit',
      'Submitted',
      'Returned',
      'Paid',
      'Over Age',
    ];

    // Toggle selection for a given fruit by name
    $scope.paystatusSelection = function paystatusSelection(paystatus) {
      var idx = $scope.selectedpaystatus.indexOf(paystatus);

      // Is currently selected
      if (idx > -1) {
        $scope.selectedpaystatus.splice(idx, 1);
      } else {
        // Is newly selected
        $scope.selectedpaystatus.push(paystatus);
      }
      $scope.getExpensebyStatus();
    };

    // -----
    //Over Age Expense Config settings

    $scope.checkedOverageDays = function() {
      var currentdate = new Date();
      commonServices.getData('/Config/Expense').then(function(data) {
        if (data) {
          $scope.expenseconfig = data;
          for (var x = 0; x < $scope.expenseconfig.length; x++) {
            if (
              Date.parse(currentdate) >=
                Date.parse($scope.expenseconfig[x].startdate) &&
              Date.parse(currentdate) <=
                Date.parse($scope.expenseconfig[x].enddate)
            ) {
              $scope.OverAgeDays = $scope.expenseconfig[x].OverAgeDays;
            }
          }
          // console.log("OverageDays includes", $scope.expenseconfig, $scope.OverAgeDays);
          $scope.getOverAgeData(); //Get Past due-Over Age data
        }
      });
    };

    $scope.getOverAgeData = function() {
      $scope.PayStatusCountData = [];
      $scope.PayStatusCountData.length = 0;

      $scope.editstatus = [];
      $scope.editstatus.length = 0;

      //Get EDIT expense record info
      $scope.editExpenseList = expenseservice.getEditStatusrec();
      $scope.iseditexist = 'false';
      var pastdue = 0;
      // $scope.$apply(function() {});
      $scope.editExpenseList.$loaded().then(function() {
        angular.forEach($scope.editExpenseList, function(list) {
          // console.log("list ", $scope.editExpenseList, list.email, $scope.useremail, $scope.iseditexist)

          if (list.email == $scope.useremail && $scope.iseditexist == 'false') {
            $timeout(function() {
              $scope.iseditexist = 'true';
              $scope.editeventdate = list.eventdate;

              //Set the Over Age days message
              $scope.daysforoverage = 0;
              pastdue = 0;
              pastdue = expenseservice.getPastDue(list.eventdate);

              if (pastdue < $scope.OverAgeDays) {
                $scope.daysforoverage = $scope.OverAgeDays - pastdue; //60 -
              }

              if (pastdue == $scope.OverAgeDays) {
                $scope.daysforoverage = 0; //60 -
              }
              if (pastdue > $scope.OverAgeDays) {
                $scope.daysforoverage = pastdue - $scope.OverAgeDays;
              }
              // console.log("pastdd", pastdue, $scope.daysforoverage, $scope.OverAgeDays);

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
    };

    //
    $scope.getExpensebyStatus = function() {
      var currentdate = new Date();
      var startdate_p1w = new Date(currentdate - 1000 * 60 * 60 * 24 * 7);
      var startdate_p30w = new Date(currentdate - 1000 * 60 * 60 * 24 * 30);
      var startdate_p90w = new Date(currentdate - 1000 * 60 * 60 * 24 * 90);
      var startdate_p1yr = new Date(currentdate - 1000 * 60 * 60 * 24 * 365);
      var enddate_p1w = currentdate;
      // console.log("Dash List   ", $scope.dashlist, $scope.userName);
      $scope.dashlist.$loaded().then(function() {
        $scope.ExpensebyStatusData = [];
        $scope.ExpensebyStatusData.length = 0;
        $scope.PayStatusCountData = [];
        $scope.PayStatusCountData.length = 0;
        var outputexp = [];
        var outputstat = [];
        var keys = [];
        angular.forEach($scope.dashlist, function(list) {
          var key = list.SubmitBy;
          var keychap = list.Chapter;
          var keyregion = list.Region;
          if (keys.indexOf(key) === -1) {
            keys.push(key);
            outputexp.push({
              OriginatorName: key,
              Chapter: keychap,
              Region: keyregion,
              PastWeek: 0,
              PastMonth: 0,
              Past3Month: 0,
              Past1Year: 0,
              ALL: 0,
            });
            // outputstat.push({
            //     "Region": keyregion,
            //     "Chapter": keychap,
            //     "Edit": 0,
            //     "Pending": 0,
            //     "Submitted": 0,
            //     "Resubmit": 0,
            //     "Returned": 0,
            //     "Paid": 0,
            //     "OverAge": 0
            // });
          }
          if (keys.indexOf(keychap) === -1) {
            keys.push(keychap);
            outputstat.push({
              Region: keyregion,
              Chapter: keychap,
              Edit: 0,
              Pending: 0,
              Submitted: 0,
              Resubmit: 0,
              Returned: 0,
              Paid: 0,
              OverAge: 0,
            });
          }
        });

        $scope.PayStatusCountData = outputstat;
        $scope.ExpensebyStatusData = outputexp;
        console.log(
          'Array1 ',
          $scope.ExpensebyStatusData,
          $scope.PayStatusCountData
        );

        angular.forEach($scope.dashlist, function(list) {
          var mdyy = list.eventdate.toString().split('/');
          var receivedDate = new Date(mdyy[2], mdyy[0] - 1, mdyy[1]);

          //Pay Expense $$ by Status Type
          for (var i = 0; i < $scope.ExpensebyStatusData.length; i++) {
            if (
              $scope.ExpensebyStatusData[i].Chapter === list.Chapter &&
              $scope.ExpensebyStatusData[i].OriginatorName === list.SubmitBy
            ) {
              // {}
              if ($scope.selectedpaystatus.includes(list.PaymentStatus)) {
                switch (list.PaymentStatus) {
                  case 'Edit':
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastWeek =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastWeek +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p30w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastMonth =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastMonth +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p90w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past3Month =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past3Month +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1yr) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past1Year =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past1Year +
                            list.Amount) *
                            100
                        ) / 100;
                    }

                    $scope.ExpensebyStatusData[i].ALL =
                      Math.round(
                        ($scope.ExpensebyStatusData[i].ALL + list.Amount) * 100
                      ) / 100;
                    break;
                  case 'Pending':
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastWeek =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastWeek +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p30w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastMonth =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastMonth +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p90w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past3Month =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past3Month +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1yr) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past1Year =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past1Year +
                            list.Amount) *
                            100
                        ) / 100;
                    }

                    $scope.ExpensebyStatusData[i].ALL =
                      Math.round(
                        ($scope.ExpensebyStatusData[i].ALL + list.Amount) * 100
                      ) / 100;
                    break;

                  case 'Resubmit':
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastWeek =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastWeek +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p30w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastMonth =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastMonth +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p90w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past3Month =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past3Month +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1yr) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past1Year =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past1Year +
                            list.Amount) *
                            100
                        ) / 100;
                    }

                    $scope.ExpensebyStatusData[i].ALL =
                      Math.round(
                        ($scope.ExpensebyStatusData[i].ALL + list.Amount) * 100
                      ) / 100;
                    break;

                  case 'Submitted':
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastWeek =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastWeek +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p30w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastMonth =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastMonth +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p90w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past3Month =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past3Month +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1yr) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past1Year =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past1Year +
                            list.Amount) *
                            100
                        ) / 100;
                    }

                    $scope.ExpensebyStatusData[i].ALL =
                      Math.round(
                        ($scope.ExpensebyStatusData[i].ALL + list.Amount) * 100
                      ) / 100;
                    break;

                  case 'Returned':
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastWeek =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastWeek +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p30w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastMonth =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastMonth +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p90w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past3Month =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past3Month +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1yr) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past1Year =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past1Year +
                            list.Amount) *
                            100
                        ) / 100;
                    }

                    $scope.ExpensebyStatusData[i].ALL =
                      Math.round(
                        ($scope.ExpensebyStatusData[i].ALL + list.Amount) * 100
                      ) / 100;
                    break;

                  case 'Paid':
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastWeek =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastWeek +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p30w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastMonth =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastMonth +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p90w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past3Month =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past3Month +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1yr) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past1Year =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past1Year +
                            list.Amount) *
                            100
                        ) / 100;
                    }

                    $scope.ExpensebyStatusData[i].ALL =
                      Math.round(
                        ($scope.ExpensebyStatusData[i].ALL + list.Amount) * 100
                      ) / 100;
                    break;

                  case 'Over Age':
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastWeek =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastWeek +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p30w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].PastMonth =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].PastMonth +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p90w) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past3Month =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past3Month +
                            list.Amount) *
                            100
                        ) / 100;
                    }
                    if (
                      Date.parse(receivedDate) >= Date.parse(startdate_p1yr) &&
                      Date.parse(receivedDate) <= Date.parse(enddate_p1w)
                    ) {
                      $scope.ExpensebyStatusData[i].Past1Year =
                        Math.round(
                          ($scope.ExpensebyStatusData[i].Past1Year +
                            list.Amount) *
                            100
                        ) / 100;
                    }

                    $scope.ExpensebyStatusData[i].ALL =
                      Math.round(
                        ($scope.ExpensebyStatusData[i].ALL + list.Amount) * 100
                      ) / 100;
                    break;
                }
              }
            }
          }

          //Status count
          for (var i = 0; i < $scope.PayStatusCountData.length; i++) {
            // console.log($scope.PayStatusCountData.length, list.PaymentStatus, $scope.PayStatusCountData[i].Chapter, list.Chapter);
            if ($scope.PayStatusCountData[i].Chapter === list.Chapter) {
              switch (list.PaymentStatus) {
                case 'Edit':
                  $scope.PayStatusCountData[i].Edit =
                    $scope.PayStatusCountData[i].Edit + 1;
                  $scope.gettotaldata.Edit = $scope.gettotaldata.Edit + 1;
                  break;
                case 'Pending':
                  $scope.PayStatusCountData[i].Pending =
                    $scope.PayStatusCountData[i].Pending + 1;
                  $scope.gettotaldata.Pending = $scope.gettotaldata.Pending + 1;
                  break;
                case 'Resubmit':
                  $scope.PayStatusCountData[i].Resubmit =
                    $scope.PayStatusCountData[i].Resubmit + 1;
                  $scope.gettotaldata.Resubmit =
                    $scope.gettotaldata.Resubmit + 1;
                  break;
                case 'Submitted':
                  $scope.PayStatusCountData[i].Submitted =
                    $scope.PayStatusCountData[i].Submitted + 1;
                  $scope.gettotaldata.Submitted =
                    $scope.gettotaldata.Submitted + 1;
                  break;
                case 'Returned':
                  $scope.PayStatusCountData[i].Returned =
                    $scope.PayStatusCountData[i].Returned + 1;
                  $scope.gettotaldata.Returned =
                    $scope.gettotaldata.Returned + 1;
                  break;
                case 'Paid':
                  $scope.PayStatusCountData[i].Paid =
                    $scope.PayStatusCountData[i].Paid + 1;
                  $scope.gettotaldata.Paid = $scope.gettotaldata.Paid + 1;
                  break;
                case 'Over Age':
                  $scope.PayStatusCountData[i].OverAge =
                    $scope.PayStatusCountData[i].OverAge + 1;
                  $scope.gettotaldata.OverAge = $scope.gettotaldata.OverAge + 1;
                  break;
              }
            }
          }
        });

        // console.log("table - ", $scope.PayStatusCountData);
        if ($scope.PayStatusCountData !== undefined) {
          $scope.buildChapterStatusData();
        }
        $scope.buildExpenseData();
        // console.log("Dash List expense ", $scope.ExpensebyStatusData);
      });
    };

    //Filter the list on expense in EDIT status
    $scope.Showmeedit = function(BillId) {
      $location.path('/expense/expensedetail/' + BillId);
    };

    //Go to View Expense list Page
    $scope.ViewExpenseList = function() {
      $location.path('/expense/viewexpense');
    };

    $scope.viewexpensedash = function() {
      $scope.getSiteData = [];
      $scope.getSiteData.length = 0;

      $scope.ExpensebyStatusData = [];
      $scope.ExpensebyStatusData.length = 0;

      $scope.userRole = userService.getRole();
      $scope.userChapter = userService.getChapter();
      $scope.useremail = commonServices.getCurrentUserEmail();
      $scope.dashlist = expenseservice.getViewExpenseData(
        $scope.useremail,
        $scope.userRole,
        $scope.userChapter
      );

      $scope.expensedash = [];
      $scope.expensedash.length = 0;
      $scope.pielabels = [];
      $scope.pielabels.length = 0;
      $scope.piedata = [];
      $scope.piedata.length = 0;
      $scope.piecolor = [];
      $scope.piecolor.length = 0;
      $scope.PieDisplay = '';

      // var apaid = 0;
      $scope.gettotaldata = {
        Edit: 0,
        Pending: 0,
        Submitted: 0,
        Resubmit: 0,
        Returned: 0,
        Paid: 0,
        OverAge: 0,
      };

      var apending = 0;
      var arrpending = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var arrpendingamt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var asubmitted = 0;
      var arrsubmitted = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var arrsubmittedamt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var aresubmit = 0;
      var arrresubmit = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var arrresubmitamt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var areturned = 0;
      var arrreturned = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var arrreturnedamt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var aoverage = 0;
      var arroverage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var arroverageamt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var apaid = 0;
      var arrpaid = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var arrpaidamt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var aedit = 0;
      var arredit = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var arreditamt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var pastdue = 0;
      var editbillid = '';
      var editeventdate = '';

      var getmonthstr = '';
      var getmonthname = '';
      var months = [
        '',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      $scope.resubmitcnt = 0;

      // $scope.piedata = [apending, aedit, asubmitted, areturned, aresubmit, apaid, aoverage];
      $scope.dashlist.$loaded().then(function() {
        $scope.checkedOverageDays(); //Get Over Age Days
        $scope.getExpensebyStatus();

        // console.log("Expense ", $scope.PayStatusCountData, $scope.ExpensebyStatusData, $scope.dashlist);
        angular.forEach($scope.dashlist, function(list) {
          getmonthstr = list.eventdate.split('/');
          getmonthname = '';
          getmonthname = months[parseInt(getmonthstr[0], 10)];

          switch (list.PaymentStatus) {
            case 'Paid':
              apaid = apaid + 1;
              if ($scope.labels1[0] == getmonthname) {
                arrpaid[0] = arrpaid[0] + 1;
                arrpaidamt[0] = arrpaidamt[0] + list.Amount;
              }
              if ($scope.labels1[1] == getmonthname) {
                arrpaid[1] = arrpaid[1] + 1;
                arrpaidamt[1] = arrpaidamt[1] + list.Amount;
              }
              if ($scope.labels1[2] == getmonthname) {
                arrpaid[2] = arrpaid[2] + 1;
                arrpaidamt[2] = arrpaidamt[2] + list.Amount;
              }
              if ($scope.labels1[3] == getmonthname) {
                arrpaid[3] = arrpaid[3] + 1;
                arrpaidamt[3] = arrpaidamt[3] + list.Amount;
              }
              if ($scope.labels1[4] == getmonthname) {
                arrpaid[4] = arrpaid[4] + 1;
                arrpaidamt[4] = arrpaidamt[4] + list.Amount;
              }
              if ($scope.labels1[5] == getmonthname) {
                arrpaid[5] = arrpaid[5] + 1;
                arrpaidamt[5] = arrpaidamt[5] + list.Amount;
              }
              if ($scope.labels1[6] == getmonthname) {
                arrpaid[6] = arrpaid[6] + 1;
                arrpaidamt[6] = arrpaidamt[6] + list.Amount;
              }
              if ($scope.labels1[7] == getmonthname) {
                arrpaid[7] = arrpaid[7] + 1;
                arrpaidamt[7] = arrpaidamt[7] + list.Amount;
              }
              if ($scope.labels1[8] == getmonthname) {
                arrpaid[8] = arrpaid[8] + 1;
                arrpaidamt[8] = arrpaidamt[8] + list.Amount;
              }
              if ($scope.labels1[9] == getmonthname) {
                arrpaid[9] = arrpaid[9] + 1;
                arrpaidamt[9] = arrpaidamt[9] + list.Amount;
              }
              if ($scope.labels1[10] == getmonthname) {
                arrpaid[10] = arrpaid[10] + 1;
                arrpaidamt[10] = arrpaidamt[10] + list.Amount;
              }
              if ($scope.labels1[11] == getmonthname) {
                arrpaid[11] = arrpaid[11] + 1;
                arrpaidamt[11] = arrpaidamt[11] + list.Amount;
              }

              // console.log("paid - ", list.Amount, arrpaid, arrpaidamt);

              break;
            case 'Edit':
              aedit = aedit + 1;
              editbillid = list.BillId;

              if ($scope.labels1[0] == getmonthname) {
                arredit[0] = arredit[0] + 1;
                arreditamt[0] = arreditamt[0] + list.Amount;
              }
              if ($scope.labels1[1] == getmonthname) {
                arredit[1] = arredit[1] + 1;
                arreditamt[1] = arreditamt[1] + list.Amount;
              }
              if ($scope.labels1[2] == getmonthname) {
                arredit[2] = arredit[2] + 1;
                arreditamt[2] = arreditamt[2] + list.Amount;
              }
              if ($scope.labels1[3] == getmonthname) {
                arredit[3] = arredit[3] + 1;
                arreditamt[3] = arreditamt[3] + list.Amount;
              }
              if ($scope.labels1[4] == getmonthname) {
                arredit[4] = arredit[4] + 1;
                arreditamt[4] = arreditamt[4] + list.Amount;
              }
              if ($scope.labels1[5] == getmonthname) {
                arredit[5] = arredit[5] + 1;
                arreditamt[5] = arreditamt[5] + list.Amount;
              }
              if ($scope.labels1[6] == getmonthname) {
                arredit[6] = arredit[6] + 1;
                arreditamt[6] = arreditamt[6] + list.Amount;
              }
              if ($scope.labels1[7] == getmonthname) {
                arredit[7] = arredit[7] + 1;
                arreditamt[7] = arreditamt[7] + list.Amount;
              }
              if ($scope.labels1[8] == getmonthname) {
                arredit[8] = arredit[8] + 1;
                arreditamt[8] = arreditamt[8] + list.Amount;
              }
              if ($scope.labels1[9] == getmonthname) {
                arredit[9] = arredit[9] + 1;
                arreditamt[9] = arreditamt[9] + list.Amount;
              }
              if ($scope.labels1[10] == getmonthname) {
                arredit[10] = arredit[10] + 1;
                arreditamt[10] = arreditamt[10] + list.Amount;
              }
              if ($scope.labels1[11] == getmonthname) {
                arredit[11] = arredit[11] + 1;
                arreditamt[11] = arreditamt[11] + list.Amount;
              }
              // console.log("edit - ", list.Amount, arredit, arreditamt);
              break;
            case 'Over Age':
              aoverage = aoverage + 1;
              if ($scope.labels1[0] == getmonthname) {
                arroverage[0] = arroverage[0] + 1;
                arroverageamt[0] = arroverageamt[0] + list.Amount;
              }
              if ($scope.labels1[1] == getmonthname) {
                arroverage[1] = arroverage[1] + 1;
                arroverageamt[1] = arroverageamt[1] + list.Amount;
              }
              if ($scope.labels1[2] == getmonthname) {
                arroverage[2] = arroverage[2] + 1;
                arroverageamt[2] = arroverageamt[2] + list.Amount;
              }
              if ($scope.labels1[3] == getmonthname) {
                arroverage[3] = arroverage[3] + 1;
                arroverageamt[3] = arroverageamt[3] + list.Amount;
              }
              if ($scope.labels1[4] == getmonthname) {
                arroverage[4] = arroverage[4] + 1;
                arroverageamt[4] = arroverageamt[4] + list.Amount;
              }
              if ($scope.labels1[5] == getmonthname) {
                arroverage[5] = arroverage[5] + 1;
                arroverageamt[5] = arroverageamt[5] + list.Amount;
              }
              if ($scope.labels1[6] == getmonthname) {
                arroverage[6] = arroverage[6] + 1;
                arroverageamt[6] = arroverageamt[6] + list.Amount;
              }
              if ($scope.labels1[7] == getmonthname) {
                arroverage[7] = arroverage[7] + 1;
                arroverageamt[7] = arroverageamt[7] + list.Amount;
              }
              if ($scope.labels1[8] == getmonthname) {
                arroverage[8] = arroverage[8] + 1;
                arroverageamt[8] = arroverageamt[8] + list.Amount;
              }
              if ($scope.labels1[9] == getmonthname) {
                arroverage[9] = arroverage[9] + 1;
                arroverageamt[9] = arroverageamt[9] + list.Amount;
              }
              if ($scope.labels1[10] == getmonthname) {
                arroverage[10] = arroverage[10] + 1;
                arroverageamt[10] = arroverageamt[10] + list.Amount;
              }
              if ($scope.labels1[11] == getmonthname) {
                arroverage[11] = arroverage[11] + 1;
                arroverageamt[11] = arroverageamt[11] + list.Amount;
              }

              // console. log("overage - ", list.Amount, arroverage, arroverageamt);
              break;
            case 'Pending':
              apending = apending + 1;
              if ($scope.labels1[0] == getmonthname) {
                arrpending[0] = arrpending[0] + 1;
                arrpendingamt[0] = arrpendingamt[0] + list.Amount;
              }
              if ($scope.labels1[1] == getmonthname) {
                arrpending[1] = arrpending[1] + 1;
                arrpendingamt[1] = arrpendingamt[1] + list.Amount;
              }
              if ($scope.labels1[2] == getmonthname) {
                arrpending[2] = arrpending[2] + 1;
                arrpendingamt[2] = arrpendingamt[2] + list.Amount;
              }
              if ($scope.labels1[3] == getmonthname) {
                arrpending[3] = arrpending[3] + 1;
                arrpendingamt[3] = arrpendingamt[3] + list.Amount;
              }
              if ($scope.labels1[4] == getmonthname) {
                arrpending[4] = arrpending[4] + 1;
                arrpendingamt[4] = arrpendingamt[4] + list.Amount;
              }
              if ($scope.labels1[5] == getmonthname) {
                arrpending[5] = arrpending[5] + 1;
                arrpendingamt[5] = arrpendingamt[5] + list.Amount;
              }
              if ($scope.labels1[6] == getmonthname) {
                arrpending[6] = arrpending[6] + 1;
                arrpendingamt[6] = arrpendingamt[6] + list.Amount;
              }
              if ($scope.labels1[7] == getmonthname) {
                arrpending[7] = arrpending[7] + 1;
                arrpendingamt[7] = arrpendingamt[7] + list.Amount;
              }
              if ($scope.labels1[8] == getmonthname) {
                arrpending[8] = arrpending[8] + 1;
                arrpendingamt[8] = arrpendingamt[8] + list.Amount;
              }
              if ($scope.labels1[9] == getmonthname) {
                arrpending[9] = arrpending[9] + 1;
                arrpendingamt[9] = arrpendingamt[9] + list.Amount;
              }
              if ($scope.labels1[10] == getmonthname) {
                arrpending[10] = arrpending[10] + 1;
                arrpendingamt[10] = arrpendingamt[10] + list.Amount;
              }
              if ($scope.labels1[11] == getmonthname) {
                arrpending[11] = arrpending[11] + 1;
                arrpendingamt[11] = arrpendingamt[11] + list.Amount;
              }

              //console.log("pending - ", list.Amount, arrpending, arrpendingamt);
              break;

            case 'Returned':
              areturned = areturned + 1;
              if ($scope.labels1[0] == getmonthname) {
                arrreturned[0] = arrreturned[0] + 1;
                arrreturnedamt[0] = arrreturnedamt[0] + list.Amount;
              }
              if ($scope.labels1[1] == getmonthname) {
                arrreturned[1] = arrreturned[1] + 1;
                arrreturnedamt[1] = arrreturnedamt[1] + list.Amount;
              }
              if ($scope.labels1[2] == getmonthname) {
                arrreturned[2] = arrreturned[2] + 1;
                arrreturnedamt[2] = arrreturnedamt[2] + list.Amount;
              }
              if ($scope.labels1[3] == getmonthname) {
                arrreturned[3] = arrreturned[3] + 1;
                arrreturnedamt[3] = arrreturnedamt[3] + list.Amount;
              }
              if ($scope.labels1[4] == getmonthname) {
                arrreturned[4] = arrreturned[4] + 1;
                arrreturnedamt[4] = arrreturnedamt[4] + list.Amount;
              }
              if ($scope.labels1[5] == getmonthname) {
                arrreturned[5] = arrreturned[5] + 1;
                arrreturnedamt[5] = arrreturnedamt[5] + list.Amount;
              }
              if ($scope.labels1[6] == getmonthname) {
                arrreturned[6] = arrreturned[6] + 1;
                arrreturnedamt[6] = arrreturnedamt[6] + list.Amount;
              }
              if ($scope.labels1[7] == getmonthname) {
                arrreturned[7] = arrreturned[7] + 1;
                arrreturnedamt[7] = arrreturnedamt[7] + list.Amount;
              }
              if ($scope.labels1[8] == getmonthname) {
                arrreturned[8] = arrreturned[8] + 1;
                arrreturnedamt[8] = arrreturnedamt[8] + list.Amount;
              }
              if ($scope.labels1[9] == getmonthname) {
                arrreturned[9] = arrreturned[9] + 1;
                arrreturnedamt[9] = arrreturnedamt[9] + list.Amount;
              }
              if ($scope.labels1[10] == getmonthname) {
                arrreturned[10] = arrreturned[10] + 1;
                arrreturnedamt[10] = arrreturnedamt[10] + list.Amount;
              }
              if ($scope.labels1[11] == getmonthname) {
                arrreturned[11] = arrreturned[11] + 1;
                arrreturnedamt[11] = arrreturnedamt[11] + list.Amount;
              }

              //console.log("returned - ", list.Amount, arrreturned, arrreturnedamt);
              break;
            case 'Resubmit':
              aresubmit = aresubmit + 1;
              if ($scope.labels1[0] == getmonthname) {
                arrresubmit[0] = arrresubmit[0] + 1;
                arrresubmitamt[0] = arrresubmitamt[0] + list.Amount;
              }
              if ($scope.labels1[1] == getmonthname) {
                arrresubmit[1] = arrresubmit[1] + 1;
                arrresubmitamt[1] = arrresubmitamt[1] + list.Amount;
              }
              if ($scope.labels1[2] == getmonthname) {
                arrresubmit[2] = arrresubmit[2] + 1;
                arrresubmitamt[2] = arrresubmitamt[2] + list.Amount;
              }
              if ($scope.labels1[3] == getmonthname) {
                arrresubmit[3] = arrresubmit[3] + 1;
                arrresubmitamt[3] = arrresubmitamt[3] + list.Amount;
              }
              if ($scope.labels1[4] == getmonthname) {
                arrresubmit[4] = arrresubmit[4] + 1;
                arrresubmitamt[4] = arrresubmitamt[4] + list.Amount;
              }
              if ($scope.labels1[5] == getmonthname) {
                arrresubmit[5] = arrresubmit[5] + 1;
                arrresubmitamt[5] = arrresubmitamt[5] + list.Amount;
              }
              if ($scope.labels1[6] == getmonthname) {
                arrresubmit[6] = arrresubmit[6] + 1;
                arrresubmitamt[6] = arrresubmitamt[6] + list.Amount;
              }
              if ($scope.labels1[7] == getmonthname) {
                arrresubmit[7] = arrresubmit[7] + 1;
                arrresubmitamt[7] = arrresubmitamt[7] + list.Amount;
              }
              if ($scope.labels1[8] == getmonthname) {
                arrresubmit[8] = arrresubmit[8] + 1;
                arrresubmitamt[8] = arrresubmitamt[8] + list.Amount;
              }
              if ($scope.labels1[9] == getmonthname) {
                arrresubmit[9] = arrresubmit[9] + 1;
                arrresubmitamt[9] = arrresubmitamt[9] + list.Amount;
              }
              if ($scope.labels1[10] == getmonthname) {
                arrresubmit[10] = arrresubmit[10] + 1;
                arrresubmitamt[10] = arrresubmitamt[10] + list.Amount;
              }
              if ($scope.labels1[11] == getmonthname) {
                arrresubmit[11] = arrresubmit[11] + 1;
                arrresubmitamt[11] = arrresubmitamt[11] + list.Amount;
              }
              if ($scope.useremail == list.email) {
                $scope.resubmitcnt = $scope.resubmitcnt + 1;
              }
              //console.log("resubmit - ", list.Amount, arrresubmit, arrresubmitamt);
              break;
            case 'Submitted':
              asubmitted = asubmitted + 1;
              if ($scope.labels1[0] == getmonthname) {
                arrsubmitted[0] = arrsubmitted[0] + 1;
                arrsubmittedamt[0] = arrsubmittedamt[0] + list.Amount;
              }
              if ($scope.labels1[1] == getmonthname) {
                arrsubmitted[1] = arrsubmitted[1] + 1;
                arrsubmittedamt[1] = arrsubmittedamt[1] + list.Amount;
              }
              if ($scope.labels1[2] == getmonthname) {
                arrsubmitted[2] = arrsubmitted[2] + 1;
                arrsubmittedamt[2] = arrsubmittedamt[2] + list.Amount;
              }
              if ($scope.labels1[3] == getmonthname) {
                arrsubmitted[3] = arrsubmitted[3] + 1;
                arrsubmittedamt[3] = arrsubmittedamt[3] + list.Amount;
              }
              if ($scope.labels1[4] == getmonthname) {
                arrsubmitted[4] = arrsubmitted[4] + 1;
                arrsubmittedamt[4] = arrsubmittedamt[4] + list.Amount;
              }
              if ($scope.labels1[5] == getmonthname) {
                arrsubmitted[5] = arrsubmitted[5] + 1;
                arrsubmittedamt[5] = arrsubmittedamt[5] + list.Amount;
              }
              if ($scope.labels1[6] == getmonthname) {
                arrsubmitted[6] = arrsubmitted[6] + 1;
                arrsubmittedamt[6] = arrsubmittedamt[6] + list.Amount;
              }
              if ($scope.labels1[7] == getmonthname) {
                arrsubmitted[7] = arrsubmitted[7] + 1;
                arrsubmittedamt[7] = arrsubmittedamt[7] + list.Amount;
              }
              if ($scope.labels1[8] == getmonthname) {
                arrsubmitted[8] = arrsubmitted[8] + 1;
                arrsubmittedamt[8] = arrsubmittedamt[8] + list.Amount;
              }
              if ($scope.labels1[9] == getmonthname) {
                arrsubmitted[9] = arrsubmitted[9] + 1;
                arrsubmittedamt[9] = arrsubmittedamt[9] + list.Amount;
              }
              if ($scope.labels1[10] == getmonthname) {
                arrsubmitted[10] = arrsubmitted[10] + 1;
                arrsubmittedamt[10] = arrsubmittedamt[10] + list.Amount;
              }
              if ($scope.labels1[11] == getmonthname) {
                arrsubmitted[11] = arrsubmitted[11] + 1;
                arrsubmittedamt[11] = arrsubmittedamt[11] + list.Amount;
              }

              //console.log("submitted - ", list.Amount, arrsubmitted, arrsubmittedamt);
              break;
          }
        });
        // $scope.pielabels = ['Pending', 'Edit', 'Submitted', 'Returned', 'Resubmit', 'Paid', 'Over Age'];

        var daysforoverage = 0;
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
          $scope.series1.push('Pending');
          $scope.data1.push(arrpending);
          $scope.data2.push(arrpendingamt);
          $scope.expensedash.push({
            Label: 'Pending',
            Data: apending,
          });
        }
        if (aedit > 0) {
          $scope.piedata.push(aedit);
          $scope.pielabels.push('Edit');
          $scope.piecolor.push('#FF6347');
          $scope.series1.push('Edit');
          $scope.data1.push(arredit);
          $scope.data2.push(arreditamt);

          $scope.expensedash.push({
            Label: 'Edit',
            Data: aedit,
          });
          // $scope.PieDisplay = $scope.PieDisplay + "Edit(" + aedit + ") ";
        }
        if (asubmitted > 0) {
          $scope.piedata.push(asubmitted);
          $scope.pielabels.push('Submitted');
          $scope.piecolor.push('#0816ff');
          $scope.series1.push('Submitted');
          $scope.data1.push(arrsubmitted);
          $scope.data2.push(arrsubmittedamt);
          $scope.expensedash.push({
            Label: 'Submitted',
            Data: asubmitted,
          });
          // $scope.PieDisplay = $scope.PieDisplay + "Submitted(" + asubmitted + ") ";
        }
        if (areturned > 0) {
          $scope.piedata.push(areturned);
          $scope.pielabels.push('Returned');
          $scope.piecolor.push('#08ffff');
          $scope.series1.push('Returned');
          $scope.data1.push(arrreturned);
          $scope.data2.push(arrreturnedamt);
          $scope.expensedash.push({
            Label: 'Returned',
            Data: areturned,
          });
          // $scope.PieDisplay = $scope.PieDisplay + "Returned(" + areturned + ") ";
        }

        if (aresubmit > 0) {
          $scope.piedata.push(aresubmit);
          $scope.pielabels.push('Resubmit');
          $scope.piecolor.push('#08ffff');
          $scope.series1.push('Resubmit');
          $scope.data1.push(arrresubmit);
          $scope.data2.push(arrresubmitamt);
          $scope.expensedash.push({
            Label: 'Resubmit',
            Data: aresubmit,
          });

          // $scope.PieDisplay = $scope.PieDisplay + "Resubmit(" + aresubmit + ") ";
        }
        if (apaid > 0) {
          $scope.piedata.push(apaid);
          $scope.pielabels.push('Paid');
          $scope.piecolor.push('#08ff21');
          $scope.series1.push('Paid');
          $scope.data1.push(arrpaid);
          $scope.data2.push(arrpaidamt);
          $scope.expensedash.push({
            Label: 'Paid',
            Data: apaid,
          });
          // $scope.PieDisplay = $scope.PieDisplay + "Paid(" + apaid + ") ";
        }
        if (aoverage > 0) {
          $scope.piedata.push(aoverage);
          $scope.pielabels.push('Over Age');
          $scope.piecolor.push('#FF0000');
          $scope.series1.push('Over Age');
          $scope.data1.push(arroverage);
          $scope.data2.push(arroverageamt);
          $scope.expensedash.push({
            Label: 'Over Age',
            Data: aoverage,
          });
          // $scope.PieDisplay = $scope.PieDisplay + "Over Age(" + aoverage + ") ";
        }
      });
    };

    //Build Data Table for viewing expense
    $scope.buildChapterStatusData = function() {
      // console.log("table - ", $scope.PayStatusCountData);
      angular.element(document).ready(function() {
        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };
        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#ChapterViewTable'))) {
          $scope.CVTable.destroy();
        }
        // var selected = [];
        $scope.CVTable = $('#ChapterViewTable').DataTable({
          responsive: true,
          autoWidth: false,
          data: $scope.PayStatusCountData, // tabledata,
          scrollY: '200px',
          // scrollX: false,
          scrollCollapse: true,
          paging: false,
          dom: 'Bfrtip',
          buttons: ['excel', 'pdf', 'print'],
          // fixedColumns: true,
          // "pagingType": "full_numbers",
          columns: [
            {
              data: 'Region',
              title: 'Region',
              width: '80px',
            },
            {
              data: 'Chapter',
              title: 'Chapter',
              width: '120px',
            },
            {
              data: 'Edit',
              title: 'Edit',
              width: '40px',
            },
            {
              data: 'Pending',
              title: 'Pending',
              width: '40px',
            },
            {
              data: 'Resubmit',
              title: 'Resubmit',
              width: '40px',
            },
            {
              data: 'Submitted',
              title: 'Submitted',
              width: '40px',
            },
            {
              data: 'Returned',
              title: 'Returned',
              width: '40px',
            },
            {
              data: 'Paid',
              title: 'Paid',
              width: '40px',
            },
            {
              data: 'OverAge',
              title: 'Over Age',
              width: '40px',
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
            {
              targets: 2,
              // width: "5%"
            },
            {
              targets: 3,
              // width: "5%"
            },
          ],
          order: [[2, 'desc']],
        });
      });
    };

    //Build Expense Amount Data Table for viewing expense
    $scope.buildExpenseData = function() {
      angular.element(document).ready(function() {
        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };
        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#ExpenseViewTable'))) {
          $scope.EVTable.destroy();
        }
        // var selected = [];
        $scope.EVTable = $('#ExpenseViewTable')
          .removeAttr('width')
          .DataTable({
            responsive: true,
            autoWidth: false,
            data: $scope.ExpensebyStatusData, // tabledata,
            scrollY: '200px',
            // scrollX: false,
            scrollCollapse: true,
            paging: false,
            dom: 'Bfrtip',
            buttons: ['excel', 'pdf', 'print'],
            // fixedColumns: true,
            // "pagingType": "full_numbers",
            columns: [
              {
                data: 'Region',
                title: 'Region',
                width: '70px',
              },
              {
                data: 'Chapter',
                title: 'Chapter',
                width: '90px',
              },
              {
                data: 'OriginatorName',
                title: 'Originator Name',
                width: '120px',
              },
              {
                data: 'PastWeek',
                title: 'Past Week',
                width: '50px',
                render: $.fn.dataTable.render.number(',', '.', 2, '$'),
              },

              {
                data: 'PastMonth',
                title: 'Past Month',
                width: '50px',
                render: $.fn.dataTable.render.number(',', '.', 2, '$'),
              },

              {
                data: 'Past3Month',
                title: 'Past 3 Month',
                width: '50px',
                render: $.fn.dataTable.render.number(',', '.', 2, '$'),
              },

              {
                data: 'Past1Year',
                title: 'Past 1 Year',
                width: '50px',
                render: $.fn.dataTable.render.number(',', '.', 2, '$'),
              },

              {
                data: 'ALL',
                title: 'ALL',
                width: '40px',
                render: $.fn.dataTable.render.number(',', '.', 2, '$'),
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
              {
                targets: 2,
                // width: "5%"
              },
              {
                targets: 3,
                // width: "5%"
              },
            ],
            order: [[2, 'desc']],
          });
      });
    };
  });
