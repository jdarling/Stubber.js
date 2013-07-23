var mongo = require('mongodb');
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;
var MongoClient = mongo.MongoClient;
var config = require('../lib/config.js').section('mongo', {});
var template = require('../lib/template');
var db;
var connectionStringTemplate = config.connectionString||'mongodb://localhost:27017';
var creds = config['admin']||{};
var connectionString = template(connectionStringTemplate, creds);

MongoClient.connect(connectionString, function(err, _db){
  db = _db;
});

module.exports = function(){
  return db;
};
