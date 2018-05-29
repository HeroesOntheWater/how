angular.module("ohanaApp").filter("eventFilter", function() {
  return function(collection, objDates) {
    var newCollection = [];
    if (objDates.start && objDates.end) {
      for (var i = 0, l = collection.length; i < l; i++) {
        if (collection[i].startTime >= objDates.start.getTime() &&
          collection[i].endTime <= objDates.end.getTime()) {
          newCollection.push(collection[i]);
        }

      }

      return newCollection;
    } else {
      return collection;
    }
  }
});
