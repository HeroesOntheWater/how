/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:NewiteminventoryformCtrl
 * @description
 * # NewiteminventoryformCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('NewItemInventoryFormCtrl', function(
    $scope,
    $uibModalInstance,
    Api
  ) {
    'use strict';

    // calendar options
    $scope.popup = {
      opened: false,
    };
    $scope.format = 'MM/dd/yyyy';
    $scope.dateOptions = {
      maxDate: new Date(),
      startingDay: 0,
      showWeeks: false,
    };

    $scope.open = function() {
      $scope.popup.opened = true;
    };

    // category dropdown data
    $scope.categories = [
      {
        value: 'kayaks_and_equip',
        displayName: 'Kayaks and Equipment',
      },
      {
        value: 'fishing_equip',
        displayName: 'Fishing Equipment',
      },
      {
        value: 'safety',
        displayName: 'Safety and PFDs',
      },
      {
        value: 'event_support',
        displayName: 'Event Support',
      },
      {
        value: 'chapter_support',
        displayName: 'Chapter Support',
      },
      {
        value: 'misc',
        displayName: 'Misc',
      },
    ];

    // condition radio data
    $scope.conditions = [
      {
        value: 'new',
        displayName: 'New',
      },
      {
        value: 'good',
        displayName: 'Good',
      },
      {
        value: 'fair',
        displayName: 'Fair',
      },
      {
        value: 'poor',
        displayName: 'Poor',
      },
      {
        value: 'broken',
        displayName: 'Broken',
      },
    ];

    // empty submit object
    $scope.newItem = {};

    $scope.postUser = function() {
      // submit form
      $scope.newItem.chapter = $('#chapter :selected').val();
      // check required fields if blank
      if (
        $scope.newItem.name_of_item == null ||
        $scope.newItem.category == null ||
        $scope.newItem.condition == null ||
        $scope.newItem.chapter == null
      ) {
        console.log($scope.newItem);
        console.log('ERROR');
        swal({
          text: 'Form incomplete!',
          type: 'warning',
          timer: 2500,
        });
      } else {
        console.log($scope.newItem);
        console.log('SUCCESS');
        Api.member.save($scope.newItem).$promise.then(
          function(val) {
            swal({
              text: 'User added!',
              type: 'success',
              timer: 2500,
            });
            $uibModalInstance.close();
          },
          function(error) {
            swal({
              text: 'Error submitting data. Please try again',
              type: 'error',
              timer: 2500,
            });
          }
        );
      }
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
