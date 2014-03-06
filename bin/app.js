var config = require('../lib/config').config;
var cluster = require('cluster');
var useCluster = (process.env.NODE_ENV==='production')||config.cluster;

if(!useCluster){
  console.log('Running in single threaded model');
  module.exports = require('../lib/webserver');
}else{
  var numCPUs = require('os').cpus().length;
  numCPUs = 4;

  if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('listening', function(worker, address) {
      console.log("Worker (" + worker.process.pid + ") is now connected to " + address.address + ":" + address.port);
    });
    cluster.on('exit', function(worker, code, signal) {
      var exitCode = worker.process.exitCode;
      console.log('Worker (' + worker.process.pid + ') died ('+exitCode+'). restarting...');
      cluster.fork();
    });
  } else {
    module.exports = require('../lib/webserver');
  }
}
// The following section of code just sets up some basics for the MemoryStore
// Really this is just here to give you some sample data, just remove it :)
/*
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