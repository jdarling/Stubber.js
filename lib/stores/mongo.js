try{
  var mongo = require('mongodb');
}catch(e){
  console.log('MongoDB is NOT installed, please "npm install mongodb" to use this module');
  throw e;
}
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;
var MongoClient = mongo.MongoClient;
var config = require('../config.js').section('store', {});
var template = require('../template');
var _db;
var connectionStringTemplate = config.connectionString||'mongodb://localhost:27017';
var creds = config['admin']||{};
var connectionString = template(connectionStringTemplate, creds);
var ObjectID = require('mongodb').ObjectID;
var utils = require('../utils');
var ObjectId = function(id){
  try{
    return ObjectID(id);
  }catch(e){
    return;
  }
};

MongoClient.connect(connectionString, function(err, db){
  _db = db;
});

var db = function(){
  return _db;
};

var Store = module.exports = function(collectionName){
  var self = this;
  var escapeKeys = function(root){
    var key, value, reEscape = /^\$/i;
    for(key in root){
      value = root[key];
      if(key.match(reEscape)){
        delete root[key];
        key = key.replace(reEscape, '\\$');
      }
      switch(typeof(value)){
        case('string'):
        case('number'):
          root[key] = value;
          break;
        default:
          root[key] = escapeKeys(value);
      }
    }
    return root;
  };
  
  var unescapeKeys = function(root){
    var key, value, reEscape = /^\\\$/i;
    for(key in root){
      value = root[key];
      if(key.match(reEscape)){
        delete root[key];
        key = key.replace(reEscape, '\$');
      }
      switch(typeof(value)){
        case('string'):
        case('number'):
          root[key] = value;
          break;
        default:
          root[key] = unescapeKeys(value);
      }
    }
    return root;
  };
  
  var collection = function(callback, collectionCallback){
    db().collection(collectionName, function(err, collection){
      if(err){
        callback(err);
      }else{
        collectionCallback(collection);
      }
    });
  };
  
  self.count = function(callback){
    collection(callback, function(collection){
      collection.count(callback);
    });
  };

  self.get = function(_id, callback){
    collection(callback, function(collection){
      collection.find(((typeof(_id)==='object')&&(!(_id instanceof ObjectId)))?_id:{_id: ObjectId(_id)}, function(err, cursor){
        if(err){
          callback(err);
        }else{
          cursor.toArray(function(err, records){
            if(err){
              callback(err);
            }else{
              if((typeof(_id)==='object')&&(_id instanceof ObjectId)){
                callback(null, unescapeKeys(records.length>1?records:records[0]));
              }else{
                callback(null, unescapeKeys(records));
              }
            }
          });
        }
      });
    });
  };
  
  self.findByField = function(field, value, callback){
    var filter = {};
    filter[field]=value;
    collection(callback, function(collection){
      collection.find(filter).toArray(function(err, records){
        if(err){
          callback(err);
        }else{
          callback(null, unescapeKeys(records));
        }
      });
    });
  };

  self.toArray = function(offset, limit, callback){
    collection(callback, function(collection){
      var options = {
        offset: offset,
        limit: limit
      };
      collection.find({}, options).toArray(callback);
    });
  };
  
  if((process.env.NODE_ENV||'dev').toLowerCase()==='production'){
    var writeConcern = {w: 'majority'};
  }else{
    var writeConcern = {w: 1};
  }
  self.insert = function(record, callback, noRetry){
    collection(callback, function(collection){
      record = escapeKeys(record);
      collection.insert(record, writeConcern, function(err, responseRecord){
        if(err&&(err.err === "norepl")&&(err.wnote === 'no replication has been enabled, so w=2+ won\'t work')){
          self.insert(record, callback);
        }else if(err && (!noRetry) && (!!responseRecord)){
          callback(null, unescapeKeys(responseRecord));
        }else{
          callback(err, unescapeKeys(responseRecord));
        }
      });
    });
  };
  
  self.delete = function(_id, callback){
    collection(callback, function(collection){
      var filter = {_id: ObjectId(_id)};
      collection.remove(filter, writeConcern, function(err, responseRecord){
        if(err&&(err.err === "norepl")&&(err.wnote === 'no replication has been enabled, so w=2+ won\'t work')){
          self.remove({_id: _id}, callback);
        }else if(err && (!noRetry) && (!!responseRecord)){
          callback(null, responseRecord);
        }else{
          callback(err, responseRecord);
        }
      });
    });
  };
  
  self.update = function(_id, record, callback){
    var findKey;
    record = escapeKeys(record);
    if(typeof(record)==='function'){
      callback = record;
    }
    if(typeof(_id)==='object'){
      record = _id;
      _id = record._id;
    }
    if(_id===void 0||_id===''||_id===false||_id===null){
      _id = (record||{})._id||false;
    }
    if((!!_id)!==false){
      findKey = {_id: ObjectId(_id)};
    }else{
      findKey = utils.extend(record.$set||record);
    }
    delete (record.$set||{})._id;
    delete record._id;
    collection(callback, function(collection){
      collection.findAndModify(findKey, {$natural: -1}, record, {upsert: true, 'new': true}, function(err, srcRecord){
        if(srcRecord){
          srcRecord._id = srcRecord._id||((!!_id)!==false)?ObjectId(_id):null;
          srcRecord = unescapeKeys(srcRecord);
        }
        callback(err, srcRecord);
      });
    });
  };
};
