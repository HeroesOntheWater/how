/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:SignWitnessWaiverCtrl
 * @description
 * # SignWitnessWaiverCtrl
 * Controller of the ohanaApp
 */
angular.module('ohanaApp').controller('SignWitnessWaiverCtrl', [
  '$scope',
  '$rootScope',
  '$q',
  'commonServices',
  'userService',
  '$uibModalInstance',
  'howLogService',
  function(
    $scope,
    $rootScope,
    $q,
    commonServices,
    userService,
    $uibModalInstance,
    howLogService
  ) {
    'use strict';
    var d = document;
    // $uibModalInstance.dismiss('cancel');
    // $rootScope.siteData.regionsChapters;
    // commonServices.getData('/userData/' + selectedUID);

    // $scope.pdfService = pdfService;
    // $scope.updateMediaWaiverTemplate = function(a, idx) {
    //     var val = a.value;
    //     var c = document.getElementById("the-canvas1").getContext("2d");
    // }

    $scope.updateMediaWaiverTemplate = function(a, idx) {
      var val = a.value;
      $scope.superObj[a.id] = a.value; //document.getElementById("the-canvas1").getContext("2d")
    };
    $scope.submitData = function() {
      $scope.updateMediaWaiverTemplate(d.getElementById('author_name'), 1);
      $scope.updateMediaWaiverTemplate(d.getElementById('author_name'), 2);
      $scope.updateMediaWaiverTemplate(d.getElementById('author_date'), 3);
      // overlayAuthorSignature();
      $scope.updateMediaWaiverTemplate(d.getElementById('author_email'), 4);
      $scope.updateMediaWaiverTemplate(d.getElementById('author_phone'), 5);
      $scope.updateMediaWaiverTemplate(d.getElementById('author_street'), 6);
      $scope.updateMediaWaiverTemplate(d.getElementById('author_apt'), 7);
      $scope.updateMediaWaiverTemplate(d.getElementById('author_city'), 8);
      $scope.updateMediaWaiverTemplate(d.getElementById('author_state'), 9);
      $scope.updateMediaWaiverTemplate(d.getElementById('author_zip'), 10);
      $scope.updateMediaWaiverTemplate(d.getElementById('witness_name'), 11);
      $scope.updateMediaWaiverTemplate(d.getElementById('witness_date'), 12);
      // overlayWitnessSignature();
      $scope.updateMediaWaiverTemplate(d.getElementById('witness_email'), 13);
      $scope.updateMediaWaiverTemplate(d.getElementById('witness_phone'), 14);
      commonServices.pushData(
        '/userData/' + userService.getId() + '/witness',
        $scope.superObj
      );

      $uibModalInstance.dismiss('cancel');
    };
    $scope.superObj = {};
  },
]);
