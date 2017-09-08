/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc overview
 * @name ohanaApp
 * @description
 * # ohanaApp
 *
 * Main module of the application.
 */
angular
  .module('ohanaApp', [
    'ngAnimate',
    'ui.bootstrap',
    'ui.select',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'summernote',
    'ui.timepicker',
    'LocalStorageModule',
    'ngMap',
    // 'uiGmapgoogle-maps',
    'firebase',
    'angularFileUpload',
    'bcherny/formatAsCurrency',
    'xeditable',
    'chart.js',
    'ui.map',
    'ui.bootstrap.datetimepicker',
  ])
  .config(function($routeProvider, $httpProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $httpProvider.interceptors.push('pageAuthInterceptor');
    $routeProvider
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl as home',
      })
      .when('/whoweare', {
        templateUrl: 'views/whoweare.html',
        //              controller: 'WhoweareCtrl as whoweare'
      })
      .when('/getinvolved', {
        templateUrl: 'views/getinvolved.html',
        controller: 'GetinvolvedCtrl as getinvolved',
      })
      .when('/chapters', {
        templateUrl: 'views/chapters.html',
        controller: 'ChaptersCtrl as chapters',
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl as login',
      })
      .when('/manage/dash', {
        templateUrl: 'views/manage/dash.html',
        controller: 'DashCtrl as dash',
      })
      .when('/dash/upcoming-events', {
        templateUrl: 'views/manage/dash.upcomingEvents.html',
        controller: 'DashUpcomingEventsCtrl as dashUpcomingEvents',
      })
      .when('/dash/broadcasts', {
        templateUrl: 'views/manage/dash.broadcasts.html',
        controller: 'DashBroadcastsCtrl as dashBroadcasts',
      })
      .when('/manage/events', {
        templateUrl: 'views/manage/events.html',
        controller: 'EventsCtrl as events',
      })
      .when('/events', {
        templateUrl: 'views/publicevents.html',
        controller: 'PubliceventsCtrl as publicEvents',
      })
      .when('/details/:id', {
        templateUrl: 'views/manage/event.details.html',
        controller: 'DetailsCtrl as eventDetail',
      })
      .when('/description', {
        templateUrl: 'views/manage/event.details.description.html',
        controller: 'EventdetaildescriptionCtrl as eventDescription',
      })
      .when('/volunteers', {
        templateUrl: 'views/manage/event.details.volunteers.html',
        controller: 'EventdetailvolunteersCtrl as eventVolunteers',
      })
      .when('/participants', {
        templateUrl: 'views/manage/event.details.participants.html',
        controller: 'EventdetailparticipantsCtrl as eventParticipants',
      })
      .when('/inventory', {
        templateUrl: 'views/manage/event.details.equipment.html',
        controller: 'InventoryCtrl as inventory',
      })
      .when('/notifications', {
        templateUrl: 'views/manage/event.details.notifications.html',
        controller: 'EventdetailnotificationCtrl as eventNotifications',
      })
      .when('/manage/broadcasts', {
        templateUrl: 'views/manage/broadcasts.html',
        controller: 'BroadcastsCtrl as broadcasts',
      })
      .when('/manage/inventory', {
        templateUrl: 'views/manage/inventory.html',
        controller: 'InventoryCtrl as inventory',
      })
      .when('/manage/training', {
        templateUrl: 'views/manage/training.html',
        //              controller: 'TrainingCtrl as training'
      })
      .when('/manage/hours', {
        templateUrl: 'views/manage/hours.html',
        //              controller: 'HoursCtrl as hours'
      })
      .when('/manage/directory', {
        templateUrl: 'views/manage/directory.html',
        controller: 'DirectoryCtrl as directory',
      })
      .when('/manage/profile', {
        templateUrl: 'views/manage/profile.html',
        controller: 'ProfileCtrl as profile',
      })
      .when('/manage/chadmin', {
        templateUrl: 'views/manage/chadmin.html',
        controller: 'ChadminCtrl',
        controllerAs: 'manage/chadmin',
        //              controller: 'ChadminCtrl as chadmin'
      })
      .when('/manage/regAdmin', {
        templateUrl: 'views/manage/regadmin.html',
        //              controller: 'RegadminCtrl as regadmin'
      })
      .when('/superAdmin', {
        templateUrl: 'views/manage/superadmin.html',
        //              controller: 'SuperadminCtrl as superadmin'
      })
      .when('/publicEvents', {
        templateUrl: 'views/public.events.html',
        controller: 'PublicEventsCtrl',
        controllerAs: 'public.events',
      })
      .when('/expense/expensedetail/:BillId', {
        templateUrl: 'views/expense/expensedetail.html',
        controller: 'ExpenseDetailsCtrl',
        controllerAs: 'expensedetail',
      })
      .when('/expense/newexpense', {
        templateUrl: 'views/expense/newexpense.html',
        controller: 'NewExpenseCtrl',
        controllerAs: 'newexpense',
      })
      .when('/expense/viewexpense', {
        templateUrl: 'views/expense/viewexpense.html',
        controller: 'ViewExpenseController',
        controllerAs: 'expense/viewexpense',
      })
      .when('/manage/chapterchat', {
        templateUrl: 'views/manage/chapterchat.html',
        controller: 'ManageChapterchatCtrl',
        controllerAs: 'manage/chapterchat',
      })
      .when('/expense/CustomDateRange', {
        templateUrl: 'views/expense/customdaterange.html',
        controller: 'ExpenseCustomdaterangeCtrl',
        controllerAs: 'expense/CustomDateRange',
      })
      .when('/expense/overview', {
        templateUrl: 'views/expense/overview.html',
        controller: 'ExpenseOverviewCtrl',
        controllerAs: 'expense/overview',
      })
      .when('/expense/expenseconfig', {
        templateUrl: 'views/expense/expenseconfig.html',
        controller: 'ExpenseConfigCtrl',
        controllerAs: 'expense/expenseconfig',
      })
      .otherwise({
        redirectTo: '/home',
      });
  })
  .run(function(
    $q,
    commonServices,
    $rootScope,
    $firebaseAuth,
    userService,
    editableOptions
  ) {
    //changing jquery editable to angular editable
    editableOptions.theme = 'bs3';

    // Test 2 (updates for chapter edit feature).
    var config = {
      apiKey: 'AIzaSyCCBKaq_W1XMDeAi0A7IjqjbTl0Svr7u78',
      authDomain: 'herosonthewatertest2.firebaseapp.com',
      databaseURL: 'https://herosonthewatertest2.firebaseio.com',
      projectId: 'herosonthewatertest2',
      storageBucket: 'herosonthewatertest2.appspot.com',
      messagingSenderId: '569173546476',
    };

    // Test 1 (Standard).
    // var config = {
    //     apiKey: "AIzaSyB0ush9ktHEJPW1C6TBmc44ANBcusetpEg",
    //     authDomain: "herosonthewater-55a79.firebaseapp.com",
    //     databaseURL: "https://herosonthewater-55a79.firebaseio.com",
    //     projectId: "herosonthewater-55a79",
    //     storageBucket: "herosonthewater-55a79.appspot.com",
    //     messagingSenderId: "183234806884"
    // };

    // Production DB.
    // var config = {
    //     apiKey: "AIzaSyBR4hC7hNOv8mKT4QW-KVcDsmZilr401W0",
    //     authDomain: "herosonthewaterprod.firebaseapp.com",
    //     databaseURL: "https://herosonthewaterprod.firebaseio.com",
    //     projectId: "herosonthewaterprod",
    //     storageBucket: "herosonthewaterprod.appspot.com",
    //     messagingSenderId: "464567079814"
    // }

    if (firebase.apps.length === 0) {
      firebase.initializeApp(config);
    }

    $rootScope.authObj = $firebaseAuth();
    $rootScope.siteData = {
      states: [],
      roles: [],
      regions: [],
      regionsChapters: [],
      chapters: [],
    };

    var getSiteData = commonServices.getData('/siteData/');

    $q.all([getSiteData]).then(function(data) {
      _.each(data[0].states, function(states) {
        $rootScope.siteData.states.push(states);
      });

      _.each(data[0].roles, function(roles) {
        $rootScope.siteData.roles.push(roles);
      });

      _.each(data[0].regions, function(regions) {
        $rootScope.siteData.regions.push(regions);
      });

      _.each(data[0].chapters, function(chapters, key) {
        chapters.key = key;
        $rootScope.siteData.chapters.push(chapters);
      });

      _.each($rootScope.siteData.regions, function(regions) {
        var chaptersByRegion = [];
        _.each($rootScope.siteData.chapters, function(chapters) {
          if (chapters.region === regions.value) {
            chaptersByRegion.push(chapters);
          }
        });
        $rootScope.siteData.regionsChapters.push({
          text: regions.text,
          value: regions.value,
          chapters: chaptersByRegion,
        });
      });

      console.log($rootScope.siteData);
    });

    $rootScope.authObj.$onAuthStateChanged(function(user) {
      if (user) {
        var currentUserId = firebase.auth().currentUser.uid;
        var currentUserData = commonServices.getData(
          '/userData/' + currentUserId
        );
        var currentUserRole = commonServices.getData(
          '/userRoles/' + currentUserId + '/role/'
        );

        $q.all([currentUserData, currentUserRole]).then(function(data) {
          var userData = data[0];
          var userRole = data[1];

          // temporary for debugging displays user logged in.
          console.log('Logged in!');
          console.log('UID: ' + currentUserId);
          console.log(
            'Name: ' + userData.name.first + ' ' + userData.name.last
          );
          console.log('Chapter: ' + userData.Chapter.text);
          console.log('Role: ' + userRole);

          // Setting session variables.
          userService.setRole(userRole);
          userService.setUserData(userData);
          userService.setUserName(userData.name.first, userData.name.last);
          userService.setId(currentUserId);
          userService.setChapter(userData.Chapter);
          $rootScope.sessionState = true;

          // Signals role change to nav.
          $rootScope.$broadcast('changeSessionUserRole', userRole);
          $rootScope.$broadcast('changeSessionState', true);
        });
      } else {
        console.log('Logged Out...');

        // Set session variables to empty, and false when user logs out
        userService.setRole('');
        userService.setUserData('');
        userService.setUserName('', '');
        userService.setId('');
        userService.setChapter('');
      }
    });

    //Firebase Logs
    // if (window.location.href.indexOf("localhost") > -1) {
    //     firebase.database.enableLogging(true, true);
    // }
  })
  .filter('unique', function() {
    // Take in the collection and which field
    //   should be unique
    // We assume an array of objects here
    // NOTE: We are skipping any object which
    //   contains a duplicated value for that
    //   particular key.  Make sure this is what
    //   you want!
    return function(arr, targetField) {
      var values = [],
        i,
        v,
        unique,
        l = arr.length,
        results = [],
        obj;
      //    console.log("unique", arr, targetField);
      // Iterate over all objects in the array
      // and collect all unique values
      for (i = 0; i < arr.length; i++) {
        obj = arr[i];

        // check for uniqueness
        unique = true;
        for (v = 0; v < values.length; v++) {
          //        console.log("unique Array data", values[v]);
          if (obj[targetField] == values[v]) {
            unique = false;
          }
        }

        // If this is indeed unique, add its
        //   value to our values and push
        //   it onto the returned array
        if (unique) {
          values.push(obj[targetField]);
          results.push(obj);
          //      console.log("Unique Chapter data", results);
        }
      }
      return results;
    };
  })
  .filter('dateRange', function() {
    return function(input, startdate, enddate) {
      var retArray = [];
      if (input != null && startdate != null && enddate != null) {
        angular.forEach(input, function(obj) {
          var receivedDate = obj.SubmitDate;

          if (
            Date.parse(receivedDate) >= Date.parse(startdate) &&
            Date.parse(receivedDate) <= Date.parse(enddate)
          ) {
            retArray.push(obj);
            // console.log("Date ", Date.parse(receivedDate), receivedDate, startdate, enddate);
          }
        });

        return retArray;
      }
    };
  });
//     .run(function($rootScope) {
//         $rootScope.typeOf = function(value) {
//             return typeof value;
//         };
//     })

// .directive('stringToNumber', function() {
//     return {
//         require: 'ngModel',
//         link: function(scope, element, attrs, ngModel) {
//             ngModel.$parsers.push(function(value) {
//                 return '' + value;
//             });
//             ngModel.$formatters.push(function(value) {
//                 return parseFloat(value);
//             });
//         }
//     };
// });
