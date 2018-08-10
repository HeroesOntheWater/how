/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ChapterAddCtrl
 * @description
 * # ChapterAddCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('ChapterAddCtrl', function(
    $q,
    $scope,
    $uibModalInstance,
    commonServices,
    $rootScope
  ) {
    'use strict';
    var submitChapter = {};
    //Form data
    $scope.regions = $rootScope.siteData.regions;
    $scope.states = [];

    // empty submit object
    $scope.newChapter = {};

    //Submit Form
    $scope.postChapter = function(newChapter) {
      //KNOWN DATA MANIPULATION
      submitChapter = angular.copy(newChapter);
      submitChapter.region = submitChapter.region.value;
      submitChapter.state = submitChapter.state.id;
      submitChapter.url = submitChapter.facebook;
      delete submitChapter.facebook;
      submitChapter.email_link =
        '<a href="' +
        submitChapter.email +
        '" target="_blank" id="slp_marker_email" class="storelocatorlink"><nobr>Email</nobr></a>';
      submitChapter.web_link =
        "<a href='" +
        submitChapter.url +
        "' target='_blank' class='storelocatorlink'>" +
        submitChapter.url +
        '</a><br/>';
      submitChapter.url_link =
        "<a href='" +
        submitChapter.url +
        "' target='_blank' class='storelocatorlink'>" +
        submitChapter.url +
        '</a><br/>';

      //TODO: UNKNOWN DATA
      submitChapter.lat = 0;
      submitChapter.lng = 0;
      submitChapter.address = '';
      submitChapter.address2 = '';
      submitChapter.attributes = '';
      submitChapter.city = '';
      submitChapter.country = '';
      submitChapter.distance = '';
      submitChapter.fax = '';
      submitChapter.featured = '';
      submitChapter.hours = '';
      submitChapter.icon = '';
      submitChapter.id = '';
      submitChapter.image = '';
      submitChapter.linked_postid = '0';
      submitChapter.neat_title = '';
      submitChapter.option_value = '';
      submitChapter.phone = '';
      submitChapter.rank = '';
      submitChapter.sl_pages_url = '';
      submitChapter.tags = '';
      //Post Chapter Data
      var newChapterKey = commonServices.getNewKey(
        '/Regions/' + submitChapter.region + '/' + submitChapter.state + '/'
      );

      // Get Key for new chapter.
      $q.all([newChapterKey]).then(function(data) {
        // Post new chapter with key, update map table.
        var result = commonServices.setData(
          '/Regions/' +
            submitChapter.region +
            '/' +
            submitChapter.state +
            '/' +
            data[0],
          submitChapter
        );
        $q.all([result]).then(function(status) {
          var updateMapTable = commonServices.setData(
            '/siteData/chapters/' + data[0],
            {
              region: submitChapter.region,
              text: submitChapter.name,
              value: submitChapter.name,
            }
          );

          // Close modal
          $scope.cancel();

          swal({
            text: 'Adding Chapter',
            type: 'success',
            timer: 2500,
          });
        });
      });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
      $rootScope.$broadcast('modalClosing');
    };

    $scope.loadStates = function() {
      switch ($scope.newChapter.region.value) {
        case 'Midwest Chapters':
          $scope.states = [
            { id: 'IA', name: 'Iowa' },
            { id: 'IL', name: 'Illinois' },
            { id: 'IN', name: 'Indiana' },
            { id: 'KS', name: 'Kansas' },
            { id: 'MI', name: 'Michigan' },
            { id: 'MN', name: 'Minnesota' },
            { id: 'MO', name: 'Missouri' },
            { id: 'ND', name: 'North Dakota' },
            { id: 'NE', name: 'Nebraska' },
            { id: 'OH', name: 'Ohio' },
            { id: 'SD', name: 'South Dakota' },
            { id: 'WI', name: 'Wisconsin' },
          ];
          break;
        case 'Northeast Chapters':
          $scope.states = [
            { id: 'CT', name: 'Connecticut' },
            { id: 'DE', name: 'Delaware' },
            { id: 'MA', name: 'Massachusetts' },
            { id: 'MD', name: 'Maryland' },
            { id: 'ME', name: 'Maine' },
            { id: 'NH', name: 'New Hampshire' },
            { id: 'NJ', name: 'New Jersey' },
            { id: 'NY', name: 'New York' },
            { id: 'PA', name: 'Pennsylvania' },
            { id: 'RI', name: 'Rhode Island' },
            { id: 'VT', name: 'Vermont' },
          ];
          break;
        case 'Pacific Chapters':
          $scope.states = [
            { id: 'AK', name: 'Alaska' },
            { id: 'CA', name: 'California' },
            { id: 'HI', name: 'Hawaii' },
            { id: 'OR', name: 'Oregon' },
            { id: 'WA', name: 'Washington' },
          ];
          break;
        case 'Rocky Mountain Chapters':
          $scope.states = [
            { id: 'CO', name: 'Colorado' },
            { id: 'ID', name: 'Idaho' },
            { id: 'MT', name: 'Montana' },
            { id: 'NV', name: 'Nevada' },
            { id: 'UT', name: 'Utah' },
            { id: 'WY', name: 'Wyoming' },
          ];
          break;
        case 'Southeast Chapters':
          $scope.states = [
            { id: 'AL', name: 'Alabama' },
            { id: 'AR', name: 'Arkansas' },
            { id: 'FL', name: 'Florida' },
            { id: 'GA', name: 'Georgia' },
            { id: 'KY', name: 'Kentucky' },
            { id: 'LA', name: 'Louisiana' },
            { id: 'MS', name: 'Mississippi' },
            { id: 'NC', name: 'North Carolina' },
            { id: 'SC', name: 'South Carolina' },
            { id: 'TN', name: 'Tennessee' },
            { id: 'VA', name: 'Virginia' },
            { id: 'WV', name: 'West Virginia' },
          ];
          break;
        case 'Southwest Chapters':
          $scope.states = [
            { id: 'AZ', name: 'Arizona' },
            { id: 'NM', name: 'New Mexico' },
            { id: 'OK', name: 'Oklahoma' },
            { id: 'TX', name: 'Texas' },
          ];
          break;
        default:
          break;
      }
    };
  });
