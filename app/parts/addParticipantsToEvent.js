/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:AddParticipantToEvent
 * @description
 * # AddParticipantToEvent
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('AddParticipantToEvent', function(
    eventData,
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance,
    $uibModal
  ) {
    'use strict';

    $scope.eventData = eventData;

    $scope.initialize = function() {
      $scope.searchTypes = ['Name', 'Phone', 'Chapter', 'Email'];
      $scope.searchType = 'Chapter';
      $scope.selectedParticipants = [];

      $('#guest_phone').mask('(999)999-9999');
      $('#search_phone').mask('(999)999-9999');

      // Add selected events participants list.

      if ($scope.eventData.type === 'participants') {
        $scope.getCurrentParticipantsList();
      } else {
        $scope.getCurrentVolunteerList();
      }

      $scope.chapters = $rootScope.siteData.chapters;
      $scope.searchChapter = $scope.chapters[0];
      $scope.foundParticipant = false;
      $scope.removeParticipants = false;
      $scope.memberOrGuest = 'Member';
    };

    $scope.getCurrentParticipantsList = function() {
      if ($scope.eventData.event.participants) {
        // Handle guests in participants list.
        var currentList = [];
        _.each($scope.eventData.event.participants, function(
          current_participant
        ) {
          currentList.push(current_participant);
        });

        // Get id for each participant, and create promise.
        var promiseArray = [];
        var guestList = [];
        _.each(currentList, function(participant) {
          if (participant.guest && participant.minor) {
            participant.nameText =
              participant.name.first + ' ' + participant.name.last + ' - Minor';
            guestList.push(participant);
          } else if (participant.guest) {
            participant.nameText =
              participant.name.first +
              ' ' +
              participant.name.last +
              ' - ' +
              participant.email;
            guestList.push(participant);
          } else {
            promiseArray.push(
              commonServices.getData('userData/' + participant.key)
            );
          }
        });

        // Run promise array and handle returned data.
        $q.all(promiseArray).then(function(data) {
          if (data) {
            _.each(data, function(udata) {
              udata.nameText =
                udata.name.first + ' ' + udata.name.last + ' - ' + udata.email;
              _.each(currentList, function(current_participant) {
                if (current_participant.key === udata.key) {
                  udata.guest = current_participant.guest;
                  return;
                }
              });
              $scope.selectedParticipants.push(udata);
            });
          } else {
            $scope.selectedParticipants = [];
          }

          $scope.selectedParticipants = $scope.selectedParticipants.concat(
            guestList
          );
        });
      } else {
        $scope.selectedParticipants = [];
      }
    };

    $scope.getCurrentVolunteerList = function() {
      if ($scope.eventData.event.volunteers) {
        // Handle guests in participants list.
        var currentList = [];
        _.each($scope.eventData.event.volunteers, function(
          current_participant
        ) {
          currentList.push(current_participant);
        });

        // Get id for each participant, and create promise.
        var promiseArray = [];
        var guestList = [];
        _.each(currentList, function(volunteer) {
          promiseArray.push(
            commonServices.getData('userData/' + volunteer.key)
          );
        });

        // Handles promises adn their data.
        $q.all(promiseArray).then(function(data) {
          if (data) {
            _.each(data, function(udata) {
              udata.nameText =
                udata.name.first + ' ' + udata.name.last + ' - ' + udata.email;
              udata.guest = false;
              $scope.selectedParticipants.push(udata);
            });
          }
        });
      } else {
        // Make sure there is a default value set.
        $scope.selectedParticipants = [];
      }
    };

    $scope.addParticipantToCurrentEvent = function() {
      var updateList = [];
      if (!_.isEmpty($scope.selectedParticipants)) {
        _.each($scope.selectedParticipants, function(selected_user) {
          // Handle guest accounts.
          if (selected_user.guest) {
            updateList.push({
              key: selected_user.key,
              guest: selected_user.guest,
              minor: selected_user.minor,
              name: selected_user.name,
              phone: selected_user.phone,
              email: selected_user.email,
              waiver: false,
            });
          } else {
            updateList.push({
              key: selected_user.key,
              guest: selected_user.guest,
            });
          }
        });
      }

      if ($scope.eventData.type === 'participants') {
        // Check to see if potential participant is already in the volunteer list
        var removeList = [];
        _.each(updateList, function(saveUser) {
          _.each($scope.eventData.event.volunteers, function(volunteerUser) {
            if (saveUser.key === volunteerUser.key) {
              removeList.push(saveUser);
            }
          });
        });

        if (!_.isEmpty(removeList)) {
          var udataPromiseArray = [];

          // Get names of each user needing to be switched.
          _.each(removeList, function(ruser) {
            udataPromiseArray.push(
              commonServices.getData('userData/' + ruser.key)
            );
          });

          // Run promise.
          $q.all(udataPromiseArray).then(function(userData) {
            if (userData) {
              // Add name for each user being switched
              _.each(userData, function(ud) {
                var counter = 0;
                _.each(removeList, function(rl) {
                  if (ud.key === rl.key) {
                    removeList[counter].name =
                      ud.name.first + ' ' + ud.name.last + ' - ' + ud.email;
                  }
                  counter++;
                });
              });

              // Create message for warning message.
              var messageString =
                'These users are in the volunteer list for this event:<br><br>';
              _.each(removeList, function(ruser) {
                messageString += '&nbsp;&nbsp;&nbsp;' + ruser.name + '<br>';
              });
              messageString +=
                '<br>would you like to remove them from the volunteer list and add them to the participants list?<br>';

              swal({
                title: 'Warning',
                text: messageString,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, continue please',
              }).then(function(result) {
                if (result) {
                  // Filter out new particpants from volunteer list.
                  var newVolunteerList = $scope.eventData.event.volunteers;
                  _.each(removeList, function(ruser) {
                    newVolunteerList = _.filter(newVolunteerList, function(
                      currentVolunteer
                    ) {
                      return !(ruser.key === currentVolunteer.key);
                    });
                  });

                  // Update volunteers list.
                  commonServices.updateData(
                    'events/' + $scope.eventData.event.key + '/volunteers',
                    newVolunteerList
                  );

                  // Update participants list.
                  commonServices.updateData(
                    'events/' + $scope.eventData.event.key + '/participants',
                    updateList
                  );

                  // Close modal.
                  $scope.cancel();

                  swal('Success', 'Update Successful!', 'success');
                }
              });
            }
          });
        } else {
          // Update participants list.
          commonServices.updateData(
            'events/' + $scope.eventData.event.key + '/participants',
            updateList
          );

          // Notify user.
          swal('Saved', 'Participants List updated!', 'success');

          // Close modal.
          $scope.cancel();
        }
      } else {
        // Check to see if potential volunteer is already in the particpants list
        var removeList = [];
        _.each(updateList, function(saveUser) {
          _.each($scope.eventData.event.participants, function(
            participantUser
          ) {
            if (saveUser.key === participantUser.key) {
              removeList.push(saveUser);
            }
          });
        });

        if (!_.isEmpty(removeList)) {
          var udataPromiseArray = [];

          // Get names of each user needing to be switched.
          _.each(removeList, function(ruser) {
            udataPromiseArray.push(
              commonServices.getData('userData/' + ruser.key)
            );
          });

          // Run promise.
          $q.all(udataPromiseArray).then(function(userData) {
            if (userData) {
              // Add name for each user being switched
              _.each(userData, function(ud) {
                var counter = 0;
                _.each(removeList, function(rl) {
                  if (ud.key === rl.key) {
                    removeList[counter].name =
                      ud.name.first + ' ' + ud.name.last + ' - ' + ud.email;
                  }
                  counter++;
                });
              });

              // Create message for warning message.
              var messageString =
                'These users are in the participants list for this event:<br><br>';
              _.each(removeList, function(ruser) {
                messageString += '&nbsp;&nbsp;&nbsp;' + ruser.name + '<br>';
              });
              messageString +=
                '<br>would you like to remove them from the particpants list and add them to the volunteer list?<br>';

              swal({
                title: 'Warning',
                text: messageString,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, continue please',
              }).then(function(result) {
                if (result) {
                  // Filter out new particpants from volunteer list.
                  var newParticipantsList = $scope.eventData.event.participants;
                  _.each(removeList, function(ruser) {
                    newParticipantsList = _.filter(
                      newParticipantsList,
                      function(currentParticipants) {
                        return !(ruser.key === currentParticipants.key);
                      }
                    );
                  });

                  // Update participants list.
                  commonServices.updateData(
                    'events/' + $scope.eventData.event.key + '/participants',
                    newParticipantsList
                  );

                  // Update volunteers list.
                  commonServices.updateData(
                    'events/' + $scope.eventData.event.key + '/volunteers',
                    updateList
                  );

                  // Close modal.
                  $scope.cancel();

                  swal('Success', 'Update Successful!', 'success');
                }
              });
            }
          });
        } else {
          // Update volunteers list.
          commonServices.updateData(
            'events/' + $scope.eventData.event.key + '/volunteers',
            updateList
          );

          // Notify user.
          swal('Saved', 'Volunteers List updated!', 'success');

          // Close modal.
          $scope.cancel();
        }
      }
    };

    $scope.createGuest = function() {
      // Generate key to be used on guest obj.
      var generateGuestKey = commonServices.getNewKey(
        'events/' + $scope.eventData.event.key + '/participants'
      );
      var existsAlready = false;

      $q.all([generateGuestKey]).then(function(data) {
        if (data[0]) {
          // Check to see if email is already being used.
          _.each($scope.selectedParticipants, function(currentUser) {
            if (currentUser.email === $scope.guestEmail) {
              existsAlready = true;
              return;
            }
          });

          // Create guest object.
          if (existsAlready) {
            var errorString =
              'Guest email matches a participant in the current participants list, please change email.';
            swal('Duplicate Email', errorString, 'error');
          } else {
            var guestObj = {};

            // Handle obj if guest is minor.
            if ($scope.guestMinor) {
              guestObj = {
                key: data[0],
                guest: true,
                minor: true,
                nameText:
                  $scope.guestFirst + ' ' + $scope.guestLast + ' - Minor',
                name: {
                  first: $scope.guestFirst,
                  last: $scope.guestLast,
                },
                phone: false,
                email: false,
              };
            } else {
              guestObj = {
                key: data[0],
                guest: true,
                minor: false,
                nameText:
                  $scope.guestFirst +
                  ' ' +
                  $scope.guestLast +
                  ' - ' +
                  $scope.guestEmail,
                name: {
                  first: $scope.guestFirst,
                  last: $scope.guestLast,
                },
                phone: $scope.guestPhone,
                email: $scope.guestEmail,
              };
            }

            // Reset fields.
            $scope.clearGuestForm();

            // Add guest obj to fount list.
            $scope.foundParticipants.push(guestObj);
          }
        }
      });
    };

    $scope.runSearch = function() {
      // Initliazed Variables.
      var searchPromise = [];
      $scope.foundParticipants = [];

      switch ($scope.searchType) {
        case 'Name':
          if ($scope.searchFirst || $scope.searchLast) {
            // Search for participant via first and last name.
            if ($scope.searchFirst) {
              searchPromise.push(
                commonServices.queryUserFirstName($scope.searchFirst)
              );
            }

            if ($scope.searchLast) {
              searchPromise.push(
                commonServices.queryUserLastName($scope.searchLast)
              );
            }

            $q.all(searchPromise).then(function(data) {
              if (data[0] || data[1]) {
                _.each(data[0], function(user, key) {
                  user.nameText =
                    user.name.first + ' ' + user.name.last + ' - ' + user.email;
                  user.key = key;
                  $scope.foundParticipants.push(user);
                });

                _.each(data[1], function(user, key) {
                  user.nameText =
                    user.name.first + ' ' + user.name.last + ' - ' + user.email;
                  user.key = key;
                  $scope.foundParticipants.push(user);
                });

                $scope.foundParticipants = _.uniq(
                  $scope.foundParticipants,
                  'key'
                );
              }

              // Show user if no participants are available.
              if (_.isEmpty($scope.foundParticipants)) {
                $scope.foundParticipants.push({
                  key: false,
                  nameText:
                    '< No participants available in - ' +
                    $scope.searchChapter.text +
                    ' >',
                });
              }
            });
          }
          break;
        case 'Email':
          if ($scope.searchEmail) {
            // Search for participants via email.
            $scope.foundParticipants = [];
            searchPromise.push(
              commonServices.queryUserEmail($scope.searchEmail)
            );
            $q.all(searchPromise).then(function(data) {
              if (data[0]) {
                _.each(data[0], function(user, key) {
                  user.nameText =
                    user.name.first + ' ' + user.name.last + ' - ' + user.email;
                  user.key = key;
                  user.guest = false;
                  $scope.foundParticipants.push(user);
                });
              }

              // Show user if no participants are available.
              if (_.isEmpty($scope.foundParticipants)) {
                $scope.foundParticipants.push({
                  key: false,
                  nameText:
                    '< No participants available in - ' +
                    $scope.searchChapter.text +
                    ' >',
                });
              }
            });
          }
          break;
        case 'Phone':
          if ($scope.searchPhone) {
            // Search for participants via email.
            $scope.foundParticipants = [];
            searchPromise.push(
              commonServices.queryUserPhone($scope.searchPhone)
            );
            $q.all(searchPromise).then(function(data) {
              if (data[0]) {
                _.each(data[0], function(user, key) {
                  user.nameText =
                    user.name.first + ' ' + user.name.last + ' - ' + user.email;
                  user.key = key;
                  user.guest = false;
                  $scope.foundParticipants.push(user);
                });
              }

              // Show user if no participants are available.
              if (_.isEmpty($scope.foundParticipants)) {
                $scope.foundParticipants.push({
                  key: false,
                  nameText:
                    '< No participants available in - ' +
                    $scope.searchChapter.text +
                    ' >',
                });
              }
            });
          }
          break;
        case 'Chapter':
          if ($scope.searchChapter) {
            // Search for participants via chapter key.
            $scope.foundParticipants = [];
            searchPromise.push(
              commonServices.queryChapterkey($scope.searchChapter.key)
            );
            $q.all(searchPromise).then(function(data) {
              if (data[0]) {
                _.each(data[0], function(user, key) {
                  user.nameText =
                    user.name.first + ' ' + user.name.last + ' - ' + user.email;
                  user.key = key;
                  user.guest = false;
                  $scope.foundParticipants.push(user);
                });
              }

              // Show user if no participants are available.
              if (_.isEmpty($scope.foundParticipants)) {
                $scope.foundParticipants.push({
                  key: false,
                  nameText:
                    '< No participants available in - ' +
                    $scope.searchChapter.text +
                    ' >',
                });
              }
            });
          }
          break;
        default:
          break;
      }
    };

    $scope.addFoundParticipant = function() {
      if ($scope.foundParticipant) {
        // Initialize Variables
        var selectedAlready = false;
        var duplicates = [];

        // Check to see if users have already been added.
        _.each($scope.foundParticipant, function(addUser) {
          if (addUser.guest) {
            $scope.foundParticipants = [];
            $scope.foundParticipant = [];
            $scope.selectedParticipants.push(addUser);
            return;
          } else {
            _.each($scope.selectedParticipants, function(currentUser) {
              if (currentUser.key === addUser.key) {
                selectedAlready = true;
                return;
              }
            });

            // Add participant if they havent already, duplicates get added to dup list.
            if (selectedAlready) {
              duplicates.push(addUser.nameText);
              selectedAlready = false;
            } else {
              addUser.guest = false;
              $scope.selectedParticipants.push(addUser);
            }
          }
        });

        // Show users were duplicates in add request.
        if (!_.isEmpty(duplicates)) {
          var errorString = '';
          _.each(duplicates, function(dups) {
            errorString += '&nbsp;&nbsp;' + dups + '<br>';
          });
          errorString +=
            '<br>have already been added to the selected participants list';
          swal('Duplicates Found', errorString, 'error');
        }
      }
    };

    $scope.removeSelectedParticipants = function() {
      if ($scope.removeParticipants) {
        // Filter out participants that need to be removed.
        _.each($scope.removeParticipants, function(removeUser) {
          $scope.selectedParticipants = _.filter(
            $scope.selectedParticipants,
            function(currentUser) {
              return currentUser.key !== removeUser.key;
            }
          );
        });
        $scope.removeParticipants = false;
      }
    };

    // Clear fields.
    $scope.clearSearch = function() {
      $scope.searchFirst = undefined;
      $scope.searchLast = undefined;
      $scope.searchEmail = undefined;
      $scope.searchPhone = undefined;
      $scope.foundParticipants = [];
      $scope.foundParticipant = false;
      $scope.search_form.$setValidity();
      $scope.search_form.$setPristine();
      $scope.search_form.$setUntouched();
    };

    // Clear sub form guest.
    $scope.clearGuestForm = function() {
      $scope.guestFirst = undefined;
      $scope.guestLast = undefined;
      $scope.guestEmail = undefined;
      $scope.guestPhone = undefined;
      $scope.guestMinor = undefined;
      $scope.search_form.$setValidity();
      $scope.search_form.$setPristine();
      $scope.search_form.$setUntouched();
      $scope.foundParticipants = [];
    };

    // close Modal.
    $scope.cancel = function() {
      var getEventData = commonServices.getData(
        'events/' + $scope.eventData.event.key
      );
      $q.all([getEventData]).then(function(data) {
        // Get must recent data for event.
        $scope.eventData.event = data[0];

        // Move user back to manage event for now (change this when we reuse module)
        $uibModalInstance.dismiss('cancel');
        $uibModal.open({
          templateUrl: '/parts/manageParticipants.html',
          controller: 'ManageParticipantsCtrl',
          resolve: {
            eventData: function() {
              return $scope.eventData;
            },
          },
        });
      });
    };
  });
