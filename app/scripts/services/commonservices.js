'use strict';

/**
 * @ngdoc service
 * @name mainAppApp.commonServices
 * @description
 * # commonServices
 * Service in the mainAppApp.
 */
angular.module('ohanaApp').service('commonServices', [
  '$rootScope',
  '$firebaseAuth',
  'DAO',
  'expenseservice',
  '$firebaseArray',
  '$q',
  function($rootScope, $firebaseAuth, DAO, expenseservice, $firebaseArray, $q) {
    /******************************************************
         *           User Management - start                  *
         *******************************************************/

    // Registers a new user to the application, requires vaild email and password.
    this.register = function(user) {
      return firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then(function() {
          var userId = firebase.auth().currentUser.uid;
          console.log('success : user registered');
          delete user.Chapter.$$hashKey;
          return firebase
            .database()
            .ref('/userData/' + userId)
            .set(user)
            .then(function(data) {
              console.log('success : user data added');
              firebase
                .database()
                .ref('/userRoles/' + userId)
                .set({
                  role: 'Participant',
                  name: user.name,
                  email: user.email,
                });
              return true;
            })
            .catch(function(error) {
              var errorCode = error.code;
              var errorMessage = error.message;
              console.log('ERROR: ' + error.code + ': ' + error.message);
              return false;
            });
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
          return false;
        });
    };

    // Signs in existing user into the application, requires valid email and password.
    this.signin = function(user) {
      return firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(function(data) {
          $rootScope.sessionState = true;
          console.log(
            'success : ' + firebase.auth().currentUser.email + ' signed In'
          );
          return {
            type: 'SUCCESS',
          };
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
          return {
            type: 'ERROR',
            code: error.code,
            message: error.message,
          };
        });
    };

    // Signs out current user.
    this.signout = function() {
      firebase
        .auth()
        .signOut()
        .then(function(data) {
          console.log('success : Signed out');
          $rootScope.userData = {};
          $rootScope.userRole = {};
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
        });
    };

    // Sends code needed for password reset to users email.
    this.sendPasswordReset = function(user) {
      return firebase
        .auth()
        .sendPasswordResetEmail(user.email)
        .then(function(data) {
          console.log('success : password reset sent');
          return true;
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
          return false;
        });
    };

    // Get current signed in Users email.
    this.getCurrentUserEmail = function() {
      var user = firebase.auth().currentUser;
      if (user != null) {
        return user.email;
      } else {
        return '';
      }
    };

    // Get current signed in Users UID.
    this.getCurrentUserUid = function() {
      var user = firebase.auth().currentUser;
      if (user != null) {
        return user.uid;
      } else {
        return '';
      }
    };

    // Returns a promise containing the users current role.
    this.getCurrentUserRole = function() {
      var user = firebase.auth().currentUser.uid;
      return firebase
        .database()
        .ref('/userRoles/' + user + '/role/')
        .once('value')
        .then(function(snapshot) {
          return snapshot.val();
        });
    };

    /******************************************************
         *             User Management - end                  *
         *******************************************************/

    /******************************************************
         *                 C.R.U.D. - start                    *
         *******************************************************/

    // Sets data at given path.
    this.setData = function(path, data) {
      firebase
        .database()
        .ref(path)
        .set(data)
        .then(function(data) {
          console.log('success : data set');
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
        });
    };
    // Adds a key and sets the data to the key based on where the path is.
    this.pushData = function(path, data) {
      return firebase
        .database()
        .ref(path)
        .push(data)
        .once('value')
        .then(function(snapshot) {
          console.log('success : data pushed');
          return snapshot.val();
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
        });
    };

    // Adds a key to the designated path, then returns the key.
    this.getNewKey = function(path) {
      return firebase
        .database()
        .ref(path)
        .push().key;
    };

    // Updates data at given path.
    this.updateData = function(path, data) {
      var updates = {};
      updates[path] = data;
      firebase
        .database()
        .ref()
        .update(updates)
        .then(function(data) {
          console.log('success : data updated');
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
        });
    };

    // Removes data from given path.
    this.removeData = function(path) {
      firebase
        .database()
        .ref(path)
        .remove()
        .then(function(data) {
          console.log('success : data Deleted');
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
        });
    };

    // Gets data from directed path, returns a promise.
    this.getData = function(path) {
      return firebase
        .database()
        .ref(path)
        .once('value')
        .then(function(snapshot) {
          return snapshot.val();
        });
    };

    // Gets user based on email
    this.getUserByEmail = function(email) {
      return firebase
        .database()
        .ref('userData')
        .orderByChild('email')
        .equalTo(email)
        .once('value')
        .then(function(snapshot) {
          return snapshot.val();
        });
    };

    // Gets user based on email with path(only for verification of volunteers, participants, guest and w/e else)
    this.getUserByEmailAtPath = function(email, path) {
      return firebase
        .database()
        .ref(path)
        .orderByChild('email')
        .equalTo(email)
        .once('value')
        .then(function(snapshot) {
          return snapshot.val();
        });
    };

    // Gets all Public events from database.
    this.getPublicEvents = function() {
      return firebase
        .database()
        .ref('events')
        .once('value')
        .then(function(snapshot) {
          console.log('Data received');
          return snapshot.val();
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
        });
    };

    /******************************************************
         *                  C.R.U.D. - end                     *
         *******************************************************/

    /******************************************************
         *           DAO object container - start             *
         *******************************************************/
    this.DAO = DAO;
    this.getEvent = function(event) {
      return firebase
        .database()
        .ref('/events')
        .orderByChild('name')
        .equalTo(event.name)
        .once('value')
        .then(function(snapshot) {
          console.log('Data received');
          return snapshot.val();
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
        });
    };

    /*******************************************************
         *           DAO object container - end                *
         *******************************************************/

    /*******************************************************
         *           Other Utility methods - start             *
         *******************************************************/

    this.addressLookup = function(zip, outerCallback) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          address: zip.toString(),
        },
        function(results, status) {
          if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
            //var coordinates = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
            var result = results[0].geometry.location;
            if (status == google.maps.GeocoderStatus.OK) {
              outerCallback({
                success: true,
                err: null,
                results: result,
              });
            } else {
              outerCallback({
                success: false,
                err: new Error(
                  'Geocode was not successful for the following reason: ' +
                    status
                ),
                results: null,
              });
            }
          }
        }
      );
    };

    this.zipCompare = function(location) {
      //console.log($rootScope.siteData.regions);
      var d = null;
      var c1, r1;
      var serv = this;
      var promises = [];
      // $rootScope.siteData.regions.forEach(function(entry) {
      _.each($rootScope.siteData.regions, function(entry) {
        var path = '/Regions/' + entry.text + '/';
        var getChapters = serv.getData(path);
        promises.push(getChapters);
        $q.all([getChapters]).then(function(data) {
          var chapterNames = [];
          if (data[0]) {
            _.each(data[0], function(state) {
              _.each(state, function(chapters) {
                var coord = new google.maps.LatLng(chapters.lat, chapters.lng);
                var d1 = google.maps.geometry.spherical.computeDistanceBetween(
                  location,
                  coord
                );
                if (d == null) {
                  d = d1;
                } else {
                  if (d1 < d) {
                    d = d1;
                    c1 = chapters.name;
                    r1 = entry;
                  }
                }
              });
            });
          } else {
            console.log('Failed to get Chapters...');
          }
        });
      });
      return $q.all(promises).then(function() {
        var answ = [];
        answ.push(c1);
        answ.push(r1);
        return answ;
      });
    };

    /******************************************************
         *            Other Utility methods - end             *
         *****************************************************/
  },
]);
