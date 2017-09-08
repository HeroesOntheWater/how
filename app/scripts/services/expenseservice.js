'use strict';

/**
 * @ngdoc service
 * @name ohanaApp.expenseservice
 * @description
 * # expenseservice
 * Service in the ohanaApp.
 */
angular
  .module('ohanaApp')
  .service('expenseservice', function(filterFilter, $firebaseArray) {
    this.expense = {
      BillId: '',
      Chapter: '',
      Region: '',
      eventdate: '',
      email: '',
      SubmitDate: '',
      SubmitBy: '',
      SubmitAddress: '',
      Description: '',
      PaymentStatus: 'Pending',
      // PaymentStatusBy: "",
      // PaymentStatusDate: "",
      PaymentLog: [
        {
          PayStatus: '',
          PayStatusBy: '',
          PayStatusDate: '',
          PayRole: '',
          PayStatusDescription: '',
        },
      ],
      Amount: 0,
      ImageURL: [],
      Line: [
        {
          ID: 1,
          Description: 'Mileage Rate - Travel @.25/mile',
          Quantity: 0, // this.exp.miles,
          Rate: 0.25,
          Amount: 0, //(this.exp.miles * .25)
        },
        {
          ID: 2,
          Description: 'Trailer Mileage Rate @.40/mile',
          Quantity: 0, //this.exp.trailermiles,
          Rate: 0.4,
          Amount: 0, //(this.exp.trailermiles * .4)
        },
      ],
    };

    this.addNewImage = function(obj) {
      this.expense.ImageURL.push(obj);
    };

    this.addNewImage = function(obj, BillId) {
      this.expense.ImageURL.push(obj);
    };

    this.getExpense = function() {
      console.log('Get Expense', expense);
      return expense;
    };

    this.addNewList = function(line) {
      expense.Line.push();
    };

    this.getExpenseAt = function(_billid) {
      this.getExpense();
      return filterFilter(expense, {
        BillId: _billid,
      })[0];
    };

    this.getExpenseChapterList = function() {
      return Chapterlist;
    };

    /******************************************************
         *  New Expense / Expense Detail - Other Expense Line  *
         *******************************************************/
    this.LineDetails = [
      {
        Description: '',
        Amount: 0,
      },
    ];

    this.addNew = function(LineDetails) {
      this.LineDetails.push({
        Description: '',
        Amount: 0,
      });
      console.log('Other expense - New Line Added', this.LineDetails);
    };

    this.deleteExpense = function(BillId) {
      var query = firebase
        .database()
        .ref('expense/')
        .orderByChild('BillId')
        .equalTo(BillId);
      query.on('child_added', function(snap) {
        var obj = snap.val();
        // console.log("key ", snap.key);
        firebase
          .database()
          .ref('expense/' + snap.key)
          .remove()
          .then(function(data) {
            console.log('success : - ', BillId, ' data Deleted');
            swal('Expense Deleted Successfully!', '', 'success');
          })
          .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log('ERROR: ' + error.code + ': ' + error.message);
            console.log('Expense - ', BillId, ' Removal Failed');
          });
      });
    };

    this.updatePaymentStatus = function(updatelist, StatusChangedBy) {
      var billkey = '';
      var currentdate = new Date();
      var StatusChangedDate = '';
      if (currentdate.getHours() > 12) {
        StatusChangedDate =
          currentdate.getMonth() +
          1 +
          '/' +
          currentdate.getDate() +
          '/' +
          currentdate.getFullYear() +
          ' ' +
          (currentdate.getHours() - 12) +
          ':' +
          currentdate.getMinutes() +
          ':' +
          currentdate.getSeconds() +
          ' PM';
      } else {
        StatusChangedDate =
          currentdate.getMonth() +
          1 +
          '/' +
          currentdate.getDate() +
          '/' +
          currentdate.getFullYear() +
          ' ' +
          currentdate.getHours() +
          ':' +
          currentdate.getMinutes() +
          ':' +
          currentdate.getSeconds() +
          ' AM';
      }

      for (var i = 0; i < updatelist.length; i++) {
        // console.log("Update service", updatelist[i]);
        var paymentstatuslog = [];
        //var expensedata = this.getEditExpenseData(updatelist[0]);
        var query = firebase
          .database()
          .ref('expense/')
          .orderByChild('BillId')
          .equalTo(updatelist[i]);
        query.on('child_added', function(snap) {
          var expensedata = snap.val();
          // console.log("Update service data", expensedata);
          billkey = snap.key;
          if (expensedata.PaymentLog.length) {
            for (var x = 0; x < expensedata.PaymentLog.length; x++) {
              paymentstatuslog.push({
                PayStatus: expensedata.PaymentLog[x].PayStatus,
                PayStatusBy: expensedata.PaymentLog[x].PayStatusBy,
                PayStatusDate: expensedata.PaymentLog[x].PayStatusDate,
                PayRole: expensedata.PaymentLog[x].PayRole,
                PayStatusDescription:
                  expensedata.PaymentLog[x].PayStatusDescription,
              });
            }
          }
          paymentstatuslog.push({
            PayStatus: 'Paid',
            PayStatusBy: StatusChangedBy,
            PayStatusDate: StatusChangedDate,
            PayRole: 'National Staff',
            PayStatusDescription: 'Agree with Chapter Lead. Expense Paid',
          });
        });
        // console.log("Scope Payment Status", paymentstatuslog, billkey);
        for (var x = 0; x < paymentstatuslog.length; x++) {
          if (paymentstatuslog[x] != null) {
            delete paymentstatuslog[x].$$hashKey;
          }
        }

        var ePaymentLog = {
          PaymentStatus: 'Paid',
          PaymentLog: paymentstatuslog,
        };

        firebase
          .database()
          .ref('expense/' + billkey)
          .update(ePaymentLog);
      }
      swal('Payment Status Updated Successfully!', '', 'success');
    };
    /******************************************************
         *        View Expense                                 *
         *******************************************************/
    this.getViewExpenseData = function(useremail, userRole, Chapter) {
      var expenselist = [];
      switch (userRole) {
        case 'Volunteer':
        case 'Participant':
          var ref = firebase
            .database()
            .ref('/expense')
            .orderByChild('email')
            .equalTo(useremail);
          break;
        case 'Chapter Lead':
          // case 'National Staff':

          var ref = firebase
            .database()
            .ref('/expense')
            .orderByChild('Chapter')
            .equalTo(Chapter.key);
          break;
        default:
          var ref = firebase
            .database()
            .ref('/expense')
            .orderByChild('SubmitDate');
          break;
      }

      var viewExpenseList = $firebaseArray(ref);
      return viewExpenseList;
    };

    //expense dash data
    this.getlast12month = function() {
      var today = new Date();
      var theMonths = new Array(
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
        'December'
      );
      var montharray = [];
      var aMonth = today.getMonth();
      // console.log("current mon", aMonth, today.getMonth() - 1);
      var i;
      for (i = 0; i < 13; i++) {
        if (i != 0) {
          montharray.push(theMonths[aMonth]);
        }
        aMonth++;
        if (aMonth > 11) {
          aMonth = 0;
        }
      }
      return montharray;
    };

    //expense dash data
    this.getlast12monthyear = function() {
      var today = new Date();
      var theMonths = new Array(
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
        'December'
      );
      var montharray = [];

      var makeDate = new Date(today);
      makeDate = new Date(makeDate.setMonth(makeDate.getMonth() - 12));
      var ayear = makeDate.getFullYear();
      var aMonth = makeDate.getMonth();

      // console.log("current mon", aMonth, today.getMonth(), ayear, makeDate, today.toString("MMMM"));
      var i;
      for (i = 0; i < 13; i++) {
        // console.log("month", theMonths[aMonth], aMonth, i, " xxx ", makeDate, makeDate.getFullYear(), montharray);
        if (i != 0) {
          montharray.push(theMonths[aMonth] + '-' + makeDate.getFullYear());
        }
        aMonth++;

        if (aMonth > 11) {
          aMonth = 0;
        }
        makeDate = new Date(makeDate.setMonth(makeDate.getMonth() + 1));
      }
      return montharray;
    };

    this.getPastDue = function(eventdate) {
      var currentdate = new Date();
      var mdyy = eventdate.toString().split('/');
      var receivedDate = new Date(mdyy[2], mdyy[0] - 1, mdyy[1]);
      // var pastdue = Math.round((currentdate.setHours(0, 0, 0, 0) - receivedDate) / (1000 * 60 * 60 * 24));
      var pastdue = 0;
      if (Date.parse(currentdate) == Date.parse(receivedDate)) {
        pastdue = 0;
      }
      if (Date.parse(currentdate) > Date.parse(receivedDate)) {
        pastdue = Math.round(
          (Date.parse(currentdate) - Date.parse(receivedDate)) /
            (1000 * 60 * 60 * 24)
        );
      }
      if (Date.parse(currentdate) < Date.parse(receivedDate)) {
        pastdue =
          Date.parse(receivedDate) -
          Date.parse(currentdate) / (1000 * 60 * 60 * 24);
      }

      // console.log("due", pastdue, currentdate, receivedDate);
      return pastdue;
    };

    this.getEditStatusrec = function() {
      var ref = firebase
        .database()
        .ref('/expense')
        .orderByChild('PaymentStatus')
        .equalTo('Edit');
      var editExpenseList = $firebaseArray(ref);
      return editExpenseList;
    };

    this.getEditExpenseData = function(billid) {
      var ref = firebase
        .database()
        .ref('/expense')
        .orderByChild('BillId')
        .equalTo(billid);
      var expense = $firebaseArray(ref);
      return expense;
    };

    this.GetViewExpenseTableData = function(useremail, userRole, Chapter) {
      // console.log("Get Data", useremail, userRole, Chapter, startdate, enddate, paystatus);
      var expenselist = [];
      var expenselistdata = [];
      var ref = '';
      switch (userRole) {
        case 'Volunteer':
        case 'Participant':
          ref = firebase
            .database()
            .ref('/expense')
            .orderByChild('email')
            .equalTo(useremail);
          console.log('ref-1');
          break;
        case 'Chapter Lead':
          ref = firebase
            .database()
            .ref('/expense')
            .orderByChild('Chapter')
            .equalTo(Chapter);
          console.log('ref-2');
          break;
        case 'National Staff':
        case 'admin':
          ref = firebase.database().ref('/expense'); //.orderByChild("SubmitDate");\
          console.log('ref-3');
          break;
      }

      var viewExpenseList = [];

      viewExpenseList = $firebaseArray(ref);

      return viewExpenseList;
    };

    this.datefilter = function(input, startdate, enddate, paystatus) {
      var retArray = [];
      if (input != null && startdate != null && enddate != null) {
        angular.forEach(input, function(obj) {
          var receivedDate = obj.SubmitDate;

          if (
            Date.parse(receivedDate) >= Date.parse(startdate) &&
            Date.parse(receivedDate) <= Date.parse(enddate)
          ) {
            retArray.push(obj);
            console.log(
              'Date ',
              Date.parse(receivedDate),
              receivedDate,
              startdate,
              enddate,
              retArray
            );
          }
        });

        var retResults = [];
        if (paystatus != null && retArray != null && paystatus != '') {
          angular.forEach(retArray, function(obj) {
            var tpaystatus = obj.PaymentStatus;

            if (tpaystatus == paystatus) {
              retResults.push(obj);
              console.log(
                'paystatus ',
                retArray,
                retResults,
                paystatus,
                tpaystatus
              );
            }
          });
        } else retResults = retArray;

        return retResults;
      }
    };

    /******************************************************
         *        Expense Supporting Documents - Images         *
         *******************************************************/

    this.deleteImage = function(Imagename, Imagearray) {
      // Create a reference to the file to delete
      var storageRef = firebase.storage().ref();
      var desertRef = storageRef.child(Imagename);
      var newDataList = [];
      console.log('Image Aarray - 0 ', Imagearray, newDataList);
      desertRef
        .delete()
        .then(function() {
          console.log('success : - ', Imagename, ' Image Deleted');
          swal(
            'Removed!',
            'Your supporting document file has been removed.',
            'success'
          );
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
          console.log('Image - ', Imagename, ' Removal Failed');
        });
    };

    this.SaveImageData = function(UniqueBillId, imageinfo) {
      // $scope.uploader.queue[i].file.name

      var imageobj = {};
      var imagefilerec = [];
      // var inp = document.getElementById('fileimage');
      console.log('file image ', imageinfo[0].file.name);

      for (var i = 0; i < imageinfo.length; ++i) {
        var filename = imageinfo[i].file.name;
        //inp.files.item(i).name;

        var _validFileExtensions = ['.jpg', '.jpeg', '.bmp', '.gif', '.png'];
        var blnValid = false;
        for (var j = 0; j < _validFileExtensions.length; j++) {
          var sCurExtension = _validFileExtensions[j];

          if (
            filename
              .substr(
                filename.length - sCurExtension.length,
                sCurExtension.length
              )
              .toLowerCase() == sCurExtension.toLowerCase()
          ) {
            var storage = firebase.storage();

            var file = imageinfo[i]._file;
            //document.getElementById("fileimage").files[i];
            console.log('load file - ', file);

            var storageRef = firebase.storage().ref();
            var path = storageRef.fullPath;

            var filelocname = 'images/' + UniqueBillId + '_' + file.name;

            storageRef
              .child(filelocname)
              .put(file)
              .then(function(snapshot) {
                if (snapshot !== undefined) {
                  return storageRef
                    .child(filelocname)
                    .getDownloadURL()
                    .then(function(url) {
                      console.log('Image func - ', url);
                      return url;
                    });
                  // console.log('Uploaded a blob or file!');
                }
              });
            var storageRef = firebase.storage().ref(filelocname);
            var uploadTask = storageRef.put(file);
            uploadTask.on('state_changed', null, null, function() {
              var downloadUrl = uploadTask.snapshot.downloadURL;
              // userInfo[pic.name] = downloadUrl;
              imagefilerec.push({
                ID: j + 1,
                ImageUrlLocation: downloadUrl,
                FileName: filelocname,
              });
              console.log('Uploaded file!', imagefilerec);
            });
          }
        }
      }
    };

    /******************************************************
         *        REPORT                                *
         *******************************************************/

    this.buildTableBody = function(data, columns) {
      var body = [];
      body.push(columns);

      data.forEach(function(row) {
        var dataRow = [];

        columns.forEach(function(column) {
          dataRow.push(row[column].toString());
        });

        body.push(dataRow);
      });
      return body;
    };

    this.table = function(data, columns) {
      return {
        style: 'demoTable',
        widths: ['60', '150', '60', '60', '60', '60', '60', '60', '200'],

        table: {
          headerRows: 1,
          body: this.buildTableBody(data, columns),
        },
      };
    };

    this.createPDFReport = function(
      rptdata,
      reportDate,
      name,
      address,
      cityinfo,
      Chaptername,
      email,
      sdate,
      edate
    ) {
      var docDefinition = {
        pageOrientation: 'landscape',
        header: {
          margin: 10,
          columns: [
            {
              margin: [10, 0, 0, 0],
              text: 'HOW Expense Report',
              fontSize: 14,
              bold: true,
              alignment: 'center',
            },
          ],
        },
        footer: {
          columns: [
            reportDate,

            {
              text: 'AT&T     ',
              alignment: 'right',
            },
          ],
        },
        styles: {
          header: {
            bold: true,
            color: '#000',
            fontSize: 11,
          },
          demoTable: {
            color: '#666',
            fontSize: 10,
          },
        },
        content: [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 5,
                x2: 750,
                y2: 5,
                lineWidth: 0.5,
              },
            ],
          },
          {
            text: '\n',
          },
          {
            columns: [
              {
                stack: [
                  // second column consists of paragraphs
                  'Payable To: ' + name,
                  'Address : ' + address,
                  'City/State/Zip : ' + cityinfo,
                ],
                fontSize: 11,
              },
              {
                stack: [
                  // second column consists of paragraphs
                  'Chapter Name : ' + Chaptername,
                  'Email Id :' + email,
                ],
                fontSize: 11,
              },
              {
                stack: [
                  // second column consists of paragraphs
                  'Expense From : ' + sdate,
                  'Expense To : ' + edate,
                ],
                fontSize: 11,
              },
            ],
          },
          {
            text: '\n',
          },
          {
            width: '',
            text: '',
          },

          this.table(rptdata, [
            'Event Date',
            'Business Purpose, Origin & Destination',
            'Miles Driven',
            'Travel @ .25/mile',
            'Trailer Miles',
            'Trailer Hauling @ .40/mile',
            'Other Expenses',
            'Total',
            'Explanation of Other Expense',
          ]),
        ],
      };
      // console.log("PDF report created", docDefinition);
      pdfMake.createPdf(docDefinition).download('ExpenseReport.pdf');
    };
  });
