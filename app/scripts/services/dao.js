'use strict';

/**
 * @ngdoc service
 * @name mainAppApp.DAO
 * @description
 * # DAO
 * Service in the mainAppApp.
 */
angular.module('ohanaApp').service('DAO', function() {
  // AngularJS will instantiate a singleton by calling "new" on this function

  var userData = function userData() {
    this.address = null;
    this.branch = null;
    this.email = null;
    this.emergency = {
      name: null,
      phone: null,
    }; //emergency should be upgraded to a list of emergency contacts
    this.gender = null;
    this.name = {
      first: null,
      last: null,
    };
    this.phone = null;
    this.years = null;
    if (arguments.length == 1) {
      angular.extend(this, arguments[0]);
    }
  };

  var report = function report() {
    this.name = null;
    this.url = null;
    this.data = null;
    this.regionId = null;
    this.chapterId = null;
    this.creatorId = null;
    this.lastModifiedId = null;
    this.typeOfReport = null;

    if (arguments.length == 1) {
      angular.extend(this.prototype, arguments[0]);
    }
  };

  var chapter = function chapter() {
    //for events, we should implement a set of hardcoded color css classes so we
    //can visually show how soon the event is.
    //images is an array of objects with a name and url for the location of the image
    this.users = null;
    this.location = {
      address: null,
      address2: null,
      city: null,
      state: null,
      zip: null,
    };
    this.staff = {};
    this.events = {
      title: null,
      allDay: null,
      start: null,
      end: null,
      description: null,
      name: null,
      data: null,
      images: {},
      participants: null,
      volunteers: null,
      LTMs: null,
      location: {
        address: null,
        address2: null,
        city: null,
        state: null,
        zip: null,
      },
    };
    this.reports = {}; //list of reports that are under a chapter. report types may vary

    if (arguments.length == 1) {
      angular.extend(this.prototype, arguments[0]);
    }
  };

  var selectedEvent = function chapter() {
    (this.title = null),
      (this.allDay = null),
      (this.startTime = null),
      (this.endTime = null),
      (this.description = null),
      (this.name = null),
      (this.data = null),
      (this.images = null),
      (this.participants = null),
      (this.volunteers = null),
      (this.location = null);
    if (arguments.length == 1) {
      angular.extend(this.prototype, arguments[0]);
    }
  };

  return {
    userData: userData,
    report: report,
    chapter: chapter,
    selectedEvent: selectedEvent,
  };
});
