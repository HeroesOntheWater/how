/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:GiveFeedbackCtrl
 * @description
 * # GiveFeedbackCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('GiveFeedbackCtrl', function(
    $rootScope,
    $q,
    userService,
    commonServices,
    $scope,
    $uibModalInstance,
    $http
  ) {
    'use strict';

    $scope.userData = userService.getUserData();
    $scope.currentUID = userService.getId();
    $scope.currentUserRole = userService.getRole();
    $scope.types = [
      {
        text: 'Bug/Defect',
        value: 0,
      },
      {
        text: 'Suggestion',
        value: 1,
      },
      {
        text: 'Other',
        value: 2,
      },
    ];

    $scope.formData = {};

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.submitForm = function() {
      var trellotoken =
        'f70b9385361218ae4f2ef50a901ff90b3b4b85c3ef115f36ddf622d2bf9cff1a';
      var trellokey = 'e5e1f0d0fe9a2f2b5e0aadc6d6043362';
      var boardNumber = '597e7ca6a79dd8a7fd939de6';
      var cardLists = [
        '597e7d0bd105b5a5f55f078e',
        '597e7d139d6f8e93b416ddb9',
        '597e7d16846e10110c114d7f',
      ];
      var listIndex = $scope.formData.type.value;
      var newCardId = new generateCardId();
      var cardId = newCardId.generate();
      var cardData =
        'name=' +
        encodeURIComponent($scope.formData.type.text) +
        '%20' +
        cardId.toString() +
        '&desc=' +
        encodeURIComponent(
          $scope.formData.description +
            '\n\nEmail: ' +
            $scope.userData.email +
            '\nUID: ' +
            $scope.currentUID +
            '\nName: ' +
            $scope.userData.name.first +
            ' ' +
            $scope.userData.name.last +
            '\nChapter: ' +
            $scope.userData.Chapter.text +
            '\nRole: ' +
            $scope.currentUserRole
        );

      $http({
        method: 'POST',
        url:
          'https://api.trello.com/1/cards?idList=' +
          encodeURIComponent(cardLists[listIndex]) +
          '&key=' +
          trellokey +
          '&token=' +
          trellotoken,
        data: cardData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then(function(response) {
        console.log(response);
      });

      $uibModalInstance.dismiss('cancel');
      swal('Success', 'Feedback Successfully sent!', 'success');
    };

    function generateCardId() {
      this.length = 8;
      this.timestamp = +new Date();

      var _getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      this.generate = function() {
        var ts = this.timestamp.toString();
        var parts = ts.split('').reverse();
        var id = '';

        for (var i = 0; i < this.length; ++i) {
          var index = _getRandomInt(0, parts.length - 1);
          id += parts[index];
        }

        return id;
      };
    }
  });
