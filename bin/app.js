require('../lib/webserver');

// The following section of code just sets up some basics for the MemoryStore
//*
(function(){
  var Store = require('../lib/store');
  var store = new Store('resources');
  store.insert({
    "name": "people",
    "schema": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string"
        },
        "age": {
          "description": "Age in years",
          "type": "integer",
          "minimum": 0
        }
      },
      "required": ["firstName", "lastName"]
    }
  }, function(){
    var people = new Store('people');
    people.insert({
      _createdOn: new Date(),
      firstName: 'Jeremy',
      lastName: 'Darling',
      email: 'jeremy.darling@gmail.com'
    }, function(){
      console.log('ready');
    });
  });
})();
//*/