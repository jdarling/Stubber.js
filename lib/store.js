/*
  Store(name)
    get(_id, callback)
    insert(record, callback)
    update(_id, record, callback)
    delete(_id, callback)
    count(callback)
    toArray(offset, limit, callback)

  To create a new store:
    store = new Store('MyStore');

  To add a record to a store:
    store.insert({some: 'value'}, function(err, record){
      console.log('record added', record._id);
    });

  To update a record:
    store.update(123, {some: 'value', another: 'value'}, function(err, record){
      console.log('record udpated', record._id);
    });

  To delete a record:
    store.delete(123, function(err, deleted){
      if(deleted){
        console.log('deleted '+deleted+' records');
      }else{
        console.log('no records deleted');
      }
    });
*/

var config = require('../lib/config');
var storeType = config.section('store', {type: 'memory'}).type; 
try{
  try{
    Store = module.exports = require(storeType);
  }catch(e){
    Store = module.exports = require('./stores/'+storeType);
  }
}catch(e){
  console.log(storeType+' not availble falling back to in-memory store.');
  console.log(e);
  if(e.stack){
    console.log(e.stack);
  }
  Store = module.exports = require('./stores/memory');
}

Store.prototype.asArray = function(offset, limit, callback){
  var self = this;
  if(arguments.length!==3){
    throw new Error('asArray requires 3 arguments; offset, limit, callback');
  }
  offset = offset||0;
  limit = limit||100;
  self.count(function(err, count){
    self.toArray(offset, limit, function(err, records){
      if(err){
        return callback(err);
      }
      var result = {root: 'records', records: records, offset: offset, limit: limit, count: count, length: records.length||0};
      callback(null, result);
    });
  });
};
