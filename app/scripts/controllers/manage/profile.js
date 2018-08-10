/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 *
 */
angular
  .module('ohanaApp')
  .controller('ProfileCtrl', function(
    $scope,
    $rootScope,
    $q,
    commonServices,
    $uibModal,
    userService,
    $filter,
    $http
  ) {
    'use strict';

    $scope.profileData = {};

    $scope.$on('updateProfile', function(event, arg) {
      if (arg) {
        $scope.update(false);
      }
    });

    $scope.$on('modalClosing', function() {
      $scope.update(false);
    });

    $scope.update = function(canApply) {
      $scope.profileData = userService.getUserData();
      $scope.profileData.years = parseInt($scope.profileData.years);
      $scope.profileData.role = userService.getRole();
      $scope.userUID = userService.getId();
      $scope.addEditableListeners();
      if (canApply) {
        $scope.$apply();
      }
    };

    $scope.open = function($event, elementOpened) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened[elementOpened] = !$scope.opened[elementOpened];
    };

    $scope.changePassword = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/changePassword.html',
        controller: 'changePassword',
      });
    };

    $scope.saveUserData = function(value, typeOfData) {
      var firebaseTable = null;
      switch (typeOfData) {
        case 'name.first':
          firebaseTable = '/name/first/';
          break;
        case 'name.last':
          firebaseTable = '/name/last/';
          break;
        case 'address.line1':
          firebaseTable = '/address/line1/';
          break;
        case 'address.line2':
          firebaseTable = '/address/line2/';
          break;
        case 'address.city':
          firebaseTable = '/address/city/';
          break;
        case 'address.state':
          firebaseTable = '/address/state/';
          break;
        case 'address.zip':
          firebaseTable = '/address/zip/';
          break;
        case 'phone':
          firebaseTable = '/phone/';
          break;
        case 'Region':
          firebaseTable = '/Region/';
          break;
        case 'Chapter':
          firebaseTable = '/Chapter/';
          break;
        case 'DOB':
          firebaseTable = '/DOB/';
          break;
        case 'branch':
          firebaseTable = '/branch/';
          break;
        case 'gender':
          firebaseTable = '/gender/';
          break;
        case 'years':
          firebaseTable = '/years/';
          break;
      }

      var packet = value;
      var tempData = userService.getUserData();
      var path = '/userData/' + $scope.userUID + firebaseTable;
      commonServices.updateData(path, packet);

      function tree_traverse(obj_data, path, length_of_arr) {
        var next_length = length_of_arr - 1;
        if (path.includes('.')) {
          tree_traverse(
            obj_data[path.split('.')[0]],
            path.split('.')[1],
            next_length
          );
        } else {
          obj_data[path] = value;
        }
      }

      if (typeOfData.includes('.')) {
        tree_traverse(
          $rootScope.userData,
          typeOfData,
          typeOfData.split('.').length
        );
      } else {
        $rootScope.userData[typeOfData] = value;
      }
      userService.setUserData($rootScope.userData);

      return true;
    };

    // Call Modals
    $scope.changeChapter = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/changeChapter.html',
        controller: 'ChangeChapterCtrl',
        resolve: {
          selectedUID: function() {
            return false;
          },
        },
      });
    };

    $scope.editChapters = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/manageadditionalchapters.html',
        controller: 'ManageAdditionalChapters',
        resolve: {
          selectedUID: function() {
            return false;
          },
        },
      });
    };

    $scope.roleChangeRequest = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/rolerequestchangeform.html',
        controller: 'RoleRequestChangeFormCtrl as rrcf',
      });
      if (!modalInstance) {
        $scope.update(true);
      }
    };

    $scope.roleChangeStatus = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/profileRoleChangeStatus.html',
        controller: 'ProfileRoleChangeStatus as rcs',
      });
    };

    $scope.feedBackRequest = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/modals/views/giveFeedback.html',
        controller: 'GiveFeedbackCtrl as feedback',
      });
    };

    /*******************************************************
     *                 Editable functions                   *
     ********************************************************/

    $scope.addEditableListeners = function() {
      var states_list = [];
      _.each($rootScope.siteData.states, function(state) {
        states_list.push(state.name);
      });

      $('#profile_first_name').editable({
        type: 'text',
        name: 'first',
        placement: 'bottom',
        emptytext: 'null',
        display: false,
        value: '',
        validate: function(value) {
          if ($.trim(value) == '') {
            return 'Invalid Entry';
          }
        },
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'name.first');
            $scope.update(true);
          }
        },
      });
      $('#profile_last_name').editable({
        type: 'text',
        name: 'last',
        placement: 'bottom',
        emptytext: 'null',
        display: false,
        value: '',
        validate: function(value) {
          if ($.trim(value) == '') {
            return 'Invalid Entry';
          }
        },
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'name.last');
            $scope.update(true);
          }
        },
      });
      $('#profile_dob').editable({
        type: 'combodate',
        name: 'dob',
        placement: 'bottom',
        emptytext: 'null',
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
            $scope.saveUserData(params.value, 'DOB');
            $scope.update(true);
          }
        },
      });
      $('#profile_gender').editable({
        type: 'select',
        name: 'gender',
        placement: 'bottom',
        emptytext: 'null',
        showbuttons: false,
        display: false,
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'gender');
            $scope.update(true);
          }
        },
        source: function() {
          return ['M', 'F', 'N/A'];
        },
      });
      $('#profile_addr1').editable({
        type: 'text',
        name: 'addr1',
        placement: 'bottom',
        emptytext: 'null',
        display: false,
        value: '',
        validate: function(value) {
          if ($.trim(value) == '') {
            return 'Invalid Entry';
          }
        },
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'address.line1');
            $scope.update(true);
          }
        },
      });
      $('#profile_addr2').editable({
        type: 'text',
        name: 'addr2',
        placement: 'bottom',
        emptytext: 'none',
        display: false,
        value: '',
        validate: function(value) {
          if ($.trim(value) == '') {
            return 'Invalid Entry';
          }
        },
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'address.line2');
            $scope.update(true);
          }
        },
      });
      $('#profile_city').editable({
        type: 'text',
        name: 'city',
        placement: 'bottom',
        emptytext: 'null',
        display: false,
        value: '',
        validate: function(value) {
          if ($.trim(value) == '') {
            return 'Invalid Entry';
          }
        },
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'address.city');
            $scope.update(true);
          }
        },
      });
      $('#profile_state').editable({
        type: 'select',
        name: 'state',
        placement: 'bottom',
        emptytext: 'null',
        showbuttons: false,
        display: false,
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'address.state');
            $scope.update(true);
          }
        },
        source: function() {
          return states_list;
        },
      });
      $(document).on('click', '#profile_zip', function() {
        $('#profile_zip_num').mask('99999');
      });
      $('#profile_zip').editable({
        type: 'number',
        name: 'zip',
        placement: 'bottom',
        emptytext: 'null',
        tpl: '<input id="profile_zip_num">',
        display: false,
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'address.zip');
            $scope.update(true);
          }
        },
      });
      $(document).on('click', '#profile_phone', function() {
        $('#profile_phone_num').mask('(999)999-9999');
      });
      $('#profile_phone').editable({
        type: 'number',
        name: 'phone',
        placement: 'bottom',
        emptytext: 'null',
        tpl: '<input id="profile_phone_num">',
        display: false,
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'phone');
            $scope.update(true);
          }
        },
      });
      $('#profile_branch').editable({
        type: 'text',
        name: 'branch',
        placement: 'bottom',
        emptytext: 'null',
        display: false,
        value: '',
        validate: function(value) {
          if ($.trim(value) == '') {
            return 'Invalid Entry';
          }
        },
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'branch');
            $scope.update(true);
          }
        },
      });
      $('#profile_years').editable({
        type: 'number',
        name: 'years',
        placement: 'bottom',
        emptytext: 'null',
        tpl: '<input>',
        display: false,
        value: '',
        validate: function(value) {
          if ($.trim(value) == '') {
            return 'Invalid Entry';
          }
        },
        url: function(params) {
          if (params.value !== '') {
            $scope.saveUserData(params.value, 'years');
            $scope.update(true);
          }
        },
      });
    };
  });
