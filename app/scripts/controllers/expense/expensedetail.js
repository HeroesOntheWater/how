'use strict';

/**
 * @ngdoc function
 * @name ohanaApp.controller:ExpensedetailCtrl
 * @description
 * # ExpensedetailCtrl
 * Controller of the ohanaApp
 */

angular
  .module('ohanaApp')
  .controller('ExpenseDetailsCtrl', function(
    $firebaseObject,
    $scope,
    $route,
    userService,
    $routeParams,
    commonServices,
    expenseservice,
    $location,
    $uibModal,
    $log,
    $document,
    FileUploader
  ) {
    $scope.expense = {};
    $scope.expense = expenseservice.expense;

    $scope.userRole = userService.getRole();
    $scope.userName = userService.getUserData();
    $scope.useremail = commonServices.getCurrentUserEmail();
    $scope.formModel = {};
    var uploader = ($scope.uploader = new FileUploader({}));
    //----Modal -- Payment Status Log  ---------//
    var $ctrl = this;

    // console log shorthand
    var log = console.log;

    $scope.openPaymentStatusLog = function() {
      $scope.$modalInstance = $uibModal.open({
        scope: $scope,
        templateUrl: 'myModalContent.html',
        size: 'lg',
      });
    };
    $scope.ok = function() {
      $scope.$modalInstance.close();
    };

    $scope.cancel = function() {
      $scope.$modalInstance.dismiss('cancel');
    };

    //check edit
    $scope.checkeditexist = function() {
      $scope.editExpenseList = expenseservice.getEditStatusrec();

      var aedit = 0;
      $scope.iseditexist = 'false';
      $scope.editExpenseList.$loaded().then(function() {
        angular.forEach($scope.editExpenseList, function(list) {
          // console.log("list ", list)
          if (list.email == $scope.useremail && $scope.iseditexist == 'false') {
            aedit = aedit + 1;
            $scope.iseditexist = 'true';
          }
          // console.log("Edit exist", aedit, list.PaymentStatus, list.BillId, $scope.iseditexist);
        });
      });

      // console.log("Edit exist", $scope.isEditexist);
    };
    //if EDIT exist, user can not recall expense to EDIT status - Only 1 Edit allowed per user
    //Recall Expense button hidden
    $scope.checkeditexist();

    // Initialize FORM field to clear old values in creating new expense.
    $scope.LineDetails = [];
    $scope.LineDetails.length = 0;

    if ($scope.LineDetails.length) {
      for (var i = $scope.LineDetails.length; i > 0; i--) {
        $scope.LineDetails.pop();
      }
      // $scope.LineDetails = [];
      $scope.LineDetails.length = 0;
      $scope.LineDetails = expenseservice.LineDetails;
      $scope.LineDetails = [
        {
          Description: '',
          Amount: 0,
        },
      ];
    }

    //------------Addition Line Items--------------//
    $scope.addNew = function(LineDetails) {
      if ($scope.expenseemail == $scope.useremail) {
        // $scope.userRole == 'Volunteer' || $scope.userRole == 'Participant') {
        $scope.LineDetails.push({
          Description: '',
          Amount: 0,
        });
        // console.log($scope.LineDetails);
      }
    };

    $scope.remove = function() {
      var newDataList = [];
      $scope.selectedAll = false;
      angular.forEach($scope.LineDetails, function(selected) {
        if (!selected.selected) {
          newDataList.push(selected);
        }
      });

      $scope.LineDetails = newDataList;
    };
    $scope.checkAll = function() {
      if (!$scope.selectedAll) {
        $scope.selectedAll = true;
      } else {
        $scope.selectedAll = false;
      }
      angular.forEach($scope.LineDetails, function(LineDetails) {
        LineDetails.selected = $scope.selectedAll;
      });
    };

    //Other Expense line amount change
    $scope.lineAmountChange = function() {
      var vTotalLineCost = 0;
      if ($scope.LineDetails.length) {
        for (var x = 0; x < $scope.LineDetails.length; x++) {
          vTotalLineCost =
            vTotalLineCost + parseFloat($scope.LineDetails[x].Amount);
          // console.log("line amount change", x, vTotalLineCost, $scope.LineDetails[x].Amount, parseFloat($scope.LineDetails[x].Amount));
        }
      }
      $scope.TotalLineCost = vTotalLineCost;
      $scope.$applyAsync();
      // $scope.TotalLineCost = vTotalLineCost;
      // $scope.TotalLineCost = parseFloat(vTotalLineCost);
      // console.log("line amount change", $scope.TotalLineCost, $scope.LineDetails, parseFloat(item.Line[x].Amount));
    };

    //Go Back to View Expense Page
    $scope.GoBack = function() {
      // window.location = "#/expense/viewexpense";
      $location.path('/expense/viewexpense');
    };

    //View Image - Bigger size - more readable - in New Page
    $scope.viewImage = function(img) {
      window.open(
        img,
        'Expense Image - ' + $routeParams.BillId,
        'height=600,width=400'
      );
    };

    //DELETE Selected Image
    $scope.removeImage = function(imgname) {
      log('hi');
      var filearray = [];
      var filename = $scope.vimageurl[imgname].FileName;

      // console.log('Image Delete Request SWAL ', imgname);
      swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then(
        function() {
          expenseservice.deleteImage(filename, $scope.vimageurl);
          $scope.fiximagearray(filename);
        },
        function(dismiss) {
          // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
          if (dismiss === 'cancel') {
            swal(
              'Image Delete Cancelled',
              'Your supporting document file is safe',
              'error'
            );
          }
        }
      );
    };

    $scope.fiximagearray = function(filename) {
      var newDataList = [];

      if ($scope.vimageurl !== undefined) {
        for (var x = 0; x < $scope.vimageurl.length; x++) {
          if ($scope.vimageurl[x].FileName != filename) {
            newDataList.push($scope.vimageurl[x]);
          }
        }
      }
      $scope.vimageurl = newDataList;
      $scope.updateImageInfo();
      loadexpensedata();
      $route.reload(); //reload current page
    };

    //Update Supporting Image File Changes
    $scope.updateImageInfo = function() {
      var expenseupdate = {
        ImageURL: [],
      };
      var oldimagecount = 0;

      if ($scope.vimageurl !== undefined) {
        oldimagecount = $scope.vimageurl.length;
      } else {
        $scope.vimageurl = [];
        $scope.vimageurl.length = 0;
      }
      if ($scope.uploader !== undefined) {
        if ($scope.uploader.queue.length > 0) {
          for (var x = 0; x < $scope.uploader.queue.length; x++) {
            imagefilename =
              'images/' +
              $routeParams.BillId +
              '_' +
              $scope.uploader.queue[x].file.name;

            $scope.vimageurl.push({
              FileName: imagefilename,
              ID: x + 1 + oldimagecount,
              ImageUrlLocation: '',
            });
          }
        }
      }

      expenseupdate.ImageURL = $scope.vimageurl;

      var query = firebase
        .database()
        .ref('expense/')
        .orderByChild('BillId')
        .equalTo($routeParams.BillId);
      query.on('child_added', function(snap) {
        var obj = snap.val();
        // console.log("key image ", snap.key);
        firebase
          .database()
          .ref('expense/' + snap.key)
          .update(expenseupdate);
        // swal('Expense Updated Successfully!', '', 'success');
      });
    };

    //Load Expense Detail Information
    function loadexpensedata() {
      $scope.EditMode = ' - EDIT mode';
      $scope.checkeditexist(); //Check if user already have expense in EDIT status

      $scope.vimageurl = [];
      $scope.isdisabled = false;
      $scope.PayStatusLogList = [];
      $scope.PayStatusLogList.length = 0;
      $scope.vImageList = [];
      $scope.vImageList.length = 0;
      //Code added to remove $$HashKey in the array
      for (var x = 0; x < $scope.vImageList.length; x++) {
        if ($scope.vImageList[x] != null) {
          delete $scope.vImageList[x].$$hashKey;
        }
      }
      $scope.expense = expenseservice.getEditExpenseData($routeParams.BillId);

      $scope.expense.$loaded().then(function() {
        // hack to trim empty space in address, if second address is not filled out it will leave an empty space behind
        var temp = $scope.expense[0].SubmitAddress.split(',');
        temp.forEach(function(item, index, arr) {
          if (item.trim() == '') {
            arr.splice(index, 1);
          } else {
            arr[index] = item.replace(/\s+$/, '');
          }
        });
        $scope.expense[0].SubmitAddress = temp.join(',');

        angular.forEach($scope.expense, function(item) {
          // console.log("Expense Detail Loaded", $scope.expense, item.PaymentStatus);
          var img = document.createElement('img');
          var storage = firebase.storage();
          var storageRef = firebase.storage().ref();
          $scope.paystat = item.PaymentStatus;
          $scope.expenseemail = item.email;

          $scope.OverageDisable = false;
          if (item.PaymentStatus == 'Over Age') {
            swal('Overage Expense - Not editable! ', '', 'error');

            $scope.OverageDisable = true;
            $scope.EditMode = ' - READ-ONLY';
          } else {
            $scope.OverageDisable = false;
            $scope.EditMode = ' - EDIT ';
          }

          if ($scope.useremail != $scope.expenseemail) {
            $scope.EditMode = ' - READ-ONLY';
            $scope.OverageDisable = true;
          }

          //---Payment Status Change Option for Chapter Lead and National Staff
          $scope.paystatuslist = [];
          switch ($scope.userRole) {
            case 'Participant':
            case 'Volunteer':
              if (
                item.PaymentStatus == 'Pending' ||
                item.PaymentStatus == 'Submitted' ||
                item.PaymentStatus == 'Returned' ||
                item.PaymentStatus == 'Paid' ||
                item.PaymentStatus == 'Paid' ||
                item.PaymentStatus == 'Over Age'
              ) {
                $scope.OverageDisable = true;
                $scope.EditMode = ' - READ-ONLY mode';
                break;
              }
              if (
                item.PaymentStatus == 'Edit' ||
                item.PaymentStatus == 'ReSubmit'
              ) {
                $scope.OverageDisable = false;
                $scope.EditMode = ' - EDIT mode';
              }
              break;

            case 'Chapter Lead':
              if (
                item.PaymentStatus == 'Pending' ||
                item.PaymentStatus == 'Submitted'
              ) {
                $scope.paystatuslist = [
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
                    name: 'Over Age',
                    value: 'Over Age',
                  },
                ];
              }
              if (
                item.PaymentStatus == 'Returned' ||
                item.PaymentStatus == 'Resubmit'
              ) {
                $scope.paystatuslist = [
                  {
                    name: 'Returned',
                    value: 'Returned',
                  },
                  {
                    name: 'Resubmit',
                    value: 'Resubmit',
                  },
                  {
                    name: 'Over Age',
                    value: 'Over Age',
                  },
                ];
              }
              if (
                $scope.useremail != $scope.expenseemail &&
                (item.PaymentStatus == 'Pending' ||
                  item.PaymentStatus == 'Returned')
              ) {
                $scope.EditMode = ' - PAYMENT STATUS UPDATE ONLY';
                $scope.OverageDisable = true;
              } //item.PaymentStatus == 'Submitted' || (
              if (
                ($scope.useremail == $scope.expenseemail &&
                  item.PaymentStatus == 'Edit') ||
                item.PaymentStatus == 'Returned'
              ) {
                $scope.EditMode = ' - EDIT mode';
                $scope.OverageDisable = false;
                // document.getElementById('OtherExpensebtn').style.display = 'block';
              }

              if (
                $scope.useremail == $scope.expenseemail &&
                item.PaymentStatus == 'Submitted'
              ) {
                $scope.EditMode = ' - READ-ONLY';
                $scope.OverageDisable = true;
                // document.getElementById('OtherExpensebtn').style.display = 'block';
              }

              if (
                item.PaymentStatus == 'Paid' ||
                item.PaymentStatus == 'Over Age'
              ) {
                $scope.EditMode = ' - READ-ONLY';
                $scope.OverageDisable = true;
              }

              // alert("4");
              break;
            case 'National Staff':
              if (
                item.PaymentStatus == 'Submitted' ||
                item.PaymentStatus == 'Returned'
              ) {
                $scope.paystatuslist = [
                  {
                    name: 'Submitted',
                    value: 'Submitted',
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
              }

              if (
                $scope.useremail != $scope.expenseemail &&
                item.PaymentStatus == 'Submitted'
              ) {
                $scope.EditMode = ' - PAYMENT STATUS UPDATE ONLY';
                $scope.OverageDisable = true;
              }
              //item.PaymentStatus == 'Submitted' ||
              if (
                $scope.useremail == $scope.expenseemail &&
                (item.PaymentStatus == 'Edit' ||
                  item.PaymentStatus == 'Returned')
              ) {
                $scope.EditMode = ' - EDIT mode';
                $scope.OverageDisable = false;
                // document.getElementById('OtherExpensebtn').style.display = 'block';
              }

              if (
                $scope.useremail == $scope.expenseemail &&
                item.PaymentStatus == 'Submitted'
              ) {
                $scope.EditMode = ' - READ-ONLY';
                $scope.OverageDisable = true;
                // document.getElementById('OtherExpensebtn').style.display = 'block';
              }

              if (
                item.PaymentStatus == 'Paid' ||
                item.PaymentStatus == 'Over Age'
              ) {
                $scope.EditMode = ' - READ-ONLY';
                $scope.OverageDisable = true;
              }

              break;
          }
          // console.log(" status check - ", $scope.useremail, $scope.expenseemail, item.PaymentStatus);

          var storageRefPic = '';
          $scope.vimageurl = item.ImageURL;
          var vTotalLineCost = 0;

          // --- clear $scope.LineDetails Array
          $scope.LineDetails = [];
          for (var i = $scope.LineDetails.length; i > 0; i--) {
            $scope.LineDetails.pop();
          }

          //---ADD line item array ---//
          $scope.TotalLineCost = 0;

          if (item.Line.length) {
            var i = 0;

            for (var x = 0; x < item.Line.length; x++) {
              // console.log("Scope Value Data - ", item.Line[x].Amount, x);

              if (x > 1) {
                vTotalLineCost =
                  vTotalLineCost + parseFloat(item.Line[x].Amount);
                // console.log("Load amount ", vTotalLineCost, parseFloat(item.Line[x].Amount));
                $scope.LineDetails.push({
                  Description: item.Line[x].Description,
                  Amount: parseFloat(item.Line[x].Amount),
                });
              }
            }

            $scope.TotalLineCost = vTotalLineCost;
            // console.log("Scope Value", item.Line, vTotalLineCost, $scope.TotalLineCost, $scope.LineDetails);
            $scope.$applyAsync();
          }

          for (var x = 0; x < $scope.LineDetails.length; x++) {
            if ($scope.LineDetails[x] != null) {
              delete $scope.LineDetails[x].$$hashKey;
            }
          }

          if (item.PaymentLog.length) {
            for (var x = 0; x < item.PaymentLog.length; x++) {
              // console.log("Inside", $scope.LineDetails[x]);

              $scope.PayStatusLogList.push({
                PayStatus: item.PaymentLog[x].PayStatus,
                PayStatusBy: item.PaymentLog[x].PayStatusBy,
                PayStatusDate: item.PaymentLog[x].PayStatusDate,
                PayRole: item.PaymentLog[x].PayRole,
                PayStatusDescription: item.PaymentLog[x].PayStatusDescription,
              });
            }
            // console.log("Scope Payment Status", $scope.PayStatusLogList);
          }

          if (item.ImageURL) {
            // console.log("Hello Image check", item.ImageURL, $scope.vImageList);
            $scope.vImageList = [];
            var storageloc = '';
            var urlinfo = '';
            $scope.vImageList.length = 0;
            for (var i = 0; i < item.ImageURL.length; i++) {
              // console.log("Hello Image ", item.ImageURL[i].FileName, $scope.vImageList);

              storageloc = item.ImageURL[i].FileName;

              storageRef
                .child(storageloc)
                .getDownloadURL()
                .then(function(url) {
                  $scope.vImageList.push({
                    ID: i,
                    ImageSrc: url,
                    ImageName: storageloc,
                  });

                  // console.log("Image Source -a - ", $scope.vImageList, storageloc, $scope.vimageurl);
                  $scope.$applyAsync();
                })
                .catch(function(error) {
                  // Handle any errors
                  console.log('Image Source url - error', error);
                });
            }
          }
        });
      });
    }

    $scope.getImageURL = function(storageloc) {
      var refspaedtServ = firebase.database().ref('expense/');
      $scope.spaedServ = $firebaseObject(refspaedtServ);
      $scope.url = refspaedtServ.once('value').then(function(rootSnapshot) {
        var lafoto = rootSnapshot.val().foto;
        console.log('Inside image ', lafoto);
        // var starsRef = firebase.storage().ref('fotos' + lafoto);
        var storageRef = firebase.storage().ref();
        return storageRef
          .child(storageloc)
          .getDownloadURL()
          .then(function(url) {
            // return starsRef.getDownloadURL().then(function(url) {
            // console.log("la url ", url);
            $scope.returnurl = url;
            return url;
          })
          .catch(function(error) {});
      });
    };

    //-----Delete Expenses Created by the User --START-------//
    $scope.deleteexp = function() {
      var bill = $routeParams.BillId;
      var bill = $routeParams.BillId;
      console.log('Data Delete Request SWAL ', $routeParams.BillId);
      swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then(
        function() {
          expenseservice.deleteExpense(bill);
          swal('Deleted!', 'Your file has been deleted.', 'success');
          // window.location.href = "#/expense/viewexpense"
          $location.path('/expense/viewexpense');
        },
        function(dismiss) {
          // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
          if (dismiss === 'cancel') {
            swal('Cancelled', 'Your expense is safe', 'error');
          }
        }
      );
    };
    //-----Delete Expenses Created by the User ---END----------//

    $scope.setexpensedata = function(updatetype) {
      var self = this;
      var totalamt =
        $scope.expense[0].Line[0].Quantity * $scope.expense[0].Line[0].Rate +
        $scope.expense[0].Line[1].Quantity * $scope.expense[0].Line[1].Rate;
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
      // console.log("eee11", $scope.PayStatusLogList);

      //Re-Submit for Participant/Volunteer - so when they update - status changes to Pending
      //Returned for Chapter Lead - Only Payment Status update  not here
      //Expense created by Chapter Lead - then SAVE will change status to Submitted
      if (updatetype == 'update') {
        switch ($scope.paystat) {
          case 'Resubmit':
            $scope.paystat = 'Pending';
            $scope.PayStatusLogList.push({
              PayStatus: 'Pending',
              PayStatusBy: StatusChangedBy,
              PayStatusDate: StatusChangedDate,
              PayRole: $scope.userRole,
              PayStatusDescription: 'Resending expense with fixes',
            });
            break;
          case 'Returned':
            $scope.paystat = 'Submitted';
            $scope.PayStatusLogList.push({
              PayStatus: 'Submitted',
              PayStatusBy: StatusChangedBy,
              PayStatusDate: StatusChangedDate,
              PayRole: $scope.userRole,
              PayStatusDescription: 'Resending expense with fixes',
            });
            break;
        }
      } else {
        switch ($scope.userRole) {
          case 'Participant':
          case 'Volunteer':
            $scope.paystat = 'Pending';
            $scope.PayStatusLogList.push({
              PayStatus: 'Pending',
              PayStatusBy: StatusChangedBy,
              PayStatusDate: StatusChangedDate,
              PayRole: $scope.userRole,
              PayStatusDescription: 'Saved expense submitted to Chapter Lead',
            });
            break;
          case 'Chapter Lead':
          case 'National Staff':
            $scope.paystat = 'Submitted';
            $scope.PayStatusLogList.push({
              PayStatus: 'Submitted',
              PayStatusBy: StatusChangedBy,
              PayStatusDate: StatusChangedDate,
              PayRole: $scope.userRole,
              PayStatusDescription: 'Saved expense submitted to National Staff',
            });
            break;
        }
      }

      // console.log("eee1", $scope.PayStatusLogList);
      //Code added to remove $$HashKey in the array
      for (var x = 0; x < $scope.PayStatusLogList.length; x++) {
        if ($scope.PayStatusLogList[x] != null) {
          delete $scope.PayStatusLogList[x].$$hashKey;
        }
      }

      var expenseupdate = {
        Description: $scope.expense[0].Description,
        Amount: totalamt,
        PaymentStatus: $scope.paystat,
        PaymentLog: $scope.PayStatusLogList,
        Line: [
          {
            ID: '0',
            Description: $scope.expense[0].Line[0].Description,
            Quantity: $scope.expense[0].Line[0].Quantity, // this.exp.miles,
            Rate: $scope.expense[0].Line[0].Rate,
            Amount:
              $scope.expense[0].Line[0].Quantity *
              $scope.expense[0].Line[0].Rate, //(this.exp.miles * .25)
          },
          {
            ID: '1',
            Description: $scope.expense[0].Line[1].Description,
            Quantity: $scope.expense[0].Line[1].Quantity, //this.exp.trailermiles,
            Rate: $scope.expense[0].Line[1].Rate,
            Amount:
              $scope.expense[0].Line[1].Quantity *
              $scope.expense[0].Line[1].Rate, //(this.exp.trailermiles * .4)
          },
        ],
        ImageURL: [],
      };

      // console.log(expenseupdate, $scope.vimageurl);

      var oldimagecount = 0;

      if ($scope.vimageurl !== undefined) {
        oldimagecount = $scope.vimageurl.length;
      } else {
        $scope.vimageurl = [];
        $scope.vimageurl.length = 0;
      }

      if ($scope.uploader !== undefined) {
        if ($scope.uploader.queue.length > 0) {
          for (var x = 0; x < $scope.uploader.queue.length; x++) {
            imagefilename =
              'images/' +
              $routeParams.BillId +
              '_' +
              $scope.uploader.queue[x].file.name;

            $scope.vimageurl.push({
              FileName: imagefilename,
              ID: x + 1 + oldimagecount,
              ImageUrlLocation: '',
            });
          }
        }
      }
      expenseupdate.ImageURL = $scope.vimageurl;
      // console.log(expenseupdate, $scope.vimageurl);

      var imagefilename = '';

      var lineamount = 0;
      if ($scope.LineDetails.length) {
        var i = 2;
        for (var x = 0; x < $scope.LineDetails.length; x++) {
          lineamount =
            parseFloat(lineamount) + parseFloat($scope.LineDetails[x].Amount);
          // console.log("Update-", x, expenseupdate.Line, $scope.LineDetails, lineamount, totalamt);

          expenseupdate.Line.push({
            ID: i,
            Description: $scope.LineDetails[x].Description,
            Quantity: 1,
            Rate: 1,
            Amount: parseFloat($scope.LineDetails[x].Amount),
          });
          i++;
          // console.log("Update-", x, expenseupdate.Line, $scope.LineDetails[x].Amount, lineamount);
        }
        expenseupdate.Amount = totalamt + lineamount;
      }

      // var totalamt = totalamt + lineamount;
      console.log('Update', expenseupdate, totalamt);

      var imageurl = '';
      if ($scope.uploader.queue.length > 0) {
        imageurl = expenseservice.SaveImageData(
          $routeParams.BillId,
          $scope.uploader.queue
        );
        // console.log("save image - ", imageurl);
      }
      var query = firebase
        .database()
        .ref('expense/')
        .orderByChild('BillId')
        .equalTo($routeParams.BillId);
      query.on('child_added', function(snap) {
        var obj = snap.val();
        // console.log("key ", snap.key);
        firebase
          .database()
          .ref('expense/' + snap.key)
          .update(expenseupdate);
        // alert("Expense Successfully Updated ");
      });
      // console.log("eee3");
    };

    //Update Expense - SAVE  and SUBMIT - Parameter value 'update' or 'submit'
    $scope.updateexpense = function(updatetype) {
      // var self = this;
      var billid = $routeParams.BillId;
      var totalamt =
        this.dexedit.Line[0].Quantity * this.dexedit.Line[0].Rate +
        this.dexedit.Line[1].Quantity * this.dexedit.Line[1].Rate;
      var lineamount = 0;
      if ($scope.LineDetails.length) {
        var i = 2;
        for (var x = 0; x < $scope.LineDetails.length; x++) {
          lineamount =
            parseFloat(lineamount) + parseFloat($scope.LineDetails[x].Amount);
        }
      }
      totalamt = totalamt + lineamount;

      var descinfo = '';
      var supportinfo = '';
      var amountinfo = '';
      var documentcount = 0;
      if ($scope.vimageurl === undefined) {
        documentcount = $scope.uploader.queue.length;
      } else {
        documentcount = $scope.uploader.queue.length + $scope.vimageurl.length;
      }
      // var swalmessage = '';

      if (
        this.dexedit.Description === undefined ||
        this.dexedit.Description.length == 0
      ) {
        descinfo =
          '<tr><td class="swalred ">Description : </td><td class="swalred "><b>';
      } else {
        descinfo =
          '<tr><td class="swalgreen ">Description : </td><td class="swalgreen "><b>';
      }

      if (documentcount == 0) {
        supportinfo =
          '<tr><td class="swalred  ">No. of supporting documents Loaded : </td><td class="swalred  "><b> ';
      } else {
        supportinfo =
          '<tr><td class="swalgreen ">No. of supporting documents Loaded : </td><td class="swalgreen  "><b> ';
      }

      if (totalamt == 0) {
        amountinfo =
          '<tr><td class="swalred ">Expense Amount : </td><td class="swalred "><b>$ ';
      } else {
        amountinfo =
          '<tr><td class="swalgreen ">Expense Amount : </td><td class="swalgreen "><b>$ ';
      }

      if (updatetype == 'submit') {
        if (
          this.dexedit.Description === undefined ||
          this.dexedit.Description.length == 0 ||
          documentcount == 0 ||
          totalamt == 0
        ) {
          swal({
            title: 'Required fields Missing',
            type: 'error',
            html:
              '<table><tr><td class="swalgreen ">Event Date : </td><td class="swalgreen "><b>' +
              this.dexedit.eventdate +
              '</b> </td></tr>' +
              descinfo +
              this.dexedit.Description +
              '</td></tr> ' +
              supportinfo +
              documentcount +
              '</b></td> </tr> ' +
              amountinfo +
              totalamt +
              '</b></td></tr></table>',
          });
          // console.log("eee0")
        } else {
          swal({
            title: 'Confirm New Expense',
            text: 'Created Expense will be reviewed!',
            type: 'info',
            html:
              '<table><tr><td class="swaltdl ">Event Date : </td><td class="swalgreen "><b>' +
              this.dexedit.eventdate +
              '</b> </td></tr>' +
              '<tr><td class="swaltdl ">Description : </td><td class="swalgreen "><b>' +
              this.dexedit.Description +
              '</td></tr> ' +
              '<tr><td class="swaltdl ">Miles Amount : </td><td class="swalgreen "><b>$ ' +
              Math.round(
                this.dexedit.Line[0].Quantity * this.dexedit.Line[0].Rate * 100
              ) /
                100 +
              '</b></td></tr>' +
              '<tr><td class="swaltdl ">Trailer Mileage Amount : </td><td class="swalgreen "><b>$ ' +
              Math.round(
                this.dexedit.Line[1].Quantity * this.dexedit.Line[1].Rate * 100
              ) /
                100 +
              '</b></td></tr>' +
              '<tr><td class="swaltdl ">Other Expense Amount : </td><td class="swalgreen "><b>$ ' +
              Math.round(lineamount * 100) / 100 +
              '</b></td></tr>' +
              '<tr><td class="swaltdl ">Total Expense Amount : </td><td class="swalgreen "><b>$ ' +
              Math.round(totalamt * 100) / 100 +
              '</b></td></tr></table>',

            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, create it!',
          }).then(function() {
            $scope.setexpensedata(updatetype);
            swal('Expense Submitted Successfully!', '', 'success');
            $location.path('/expense/viewexpense');
          });
        }
      } else {
        $scope.setexpensedata(updatetype);
        swal('Expense Successfully Saved!', '', 'success');
        $location.path('/expense/viewexpense');
      }
    };

    //Recall Expense
    $scope.RecallExpense = function(billid, paymentstat, statreason) {
      var bill = $routeParams.BillId;
      console.log('Recall Expense request for  ', $routeParams.BillId);

      if ($scope.iseditexist == 'true') {
        swal(
          'Recall not allowed! You have 1 Expense in EDIT status',
          '',
          'info'
        );
      } else {
        swal({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, recall this expense!',
        }).then(
          function() {
            // expenseservice.deleteExpense(bill)
            $scope.UpdatePaymentStatus(billid, paymentstat, statreason);
            swal('Recalled!', 'Your expense was recalled.', 'success');
            loadexpensedata();
          },
          function(dismiss) {
            // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
            if (dismiss === 'cancel') {
              swal('Cancelled', 'Your recall request cancelled', 'info');
            }
          }
        );
      }
    };

    $scope.UpdatePaymentStatus = function(billid, paymentstat, statreason) {
      console.log('Update Payment Status - ', billid, paymentstat, statreason);
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

      $scope.PayStatusLogList.push({
        PayStatus: paymentstat,
        PayStatusBy: StatusChangedBy,
        PayStatusDate: StatusChangedDate,
        PayRole: $scope.userRole,
        PayStatusDescription: statreason,
      });

      for (var x = 0; x < $scope.PayStatusLogList.length; x++) {
        // console.log("array ", x, $scope.PayStatusLogList.length);
        if ($scope.PayStatusLogList[x] != null) {
          delete $scope.PayStatusLogList[x].$$hashKey;
        }
      }

      var ePaymentLog = {
        PaymentStatus: paymentstat,
        PaymentLog: $scope.PayStatusLogList,
      };
      // console.log(expensedata, StatusChangedDate, $scope.PayStatusLogList, ePaymentLog, $routeParams.BillId, billid);
      var query = firebase
        .database()
        .ref('expense')
        .orderByChild('BillId')
        .equalTo(billid);
      query.on('child_added', function(snap) {
        var obj = snap.val();
        // console.log("key ", snap.key, ePaymentLog);
        // commonServices.updateData('expense/' + snap.key, ePaymentLog);
        // console.log(ePaymentLog);
        firebase
          .database()
          .ref('expense/' + snap.key)
          .update(ePaymentLog);

        swal('Payment Status Updated Successfully!', '', 'success');
      });

      //This allow the user to recall expenses created by themselves
      if (paymentstat == 'Edit') {
        $location.path('/expense/expensedetail/' + billid);
        // window.location = "#/expense/expensedetail/" + billid;
      } else {
        $location.path('expense/viewexpense');
      }
    };

    loadexpensedata();
    // $scope.$applyAsync();
  });
