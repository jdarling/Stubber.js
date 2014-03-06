var stores = {};

var Store = module.exports = function(collectionName){
  var self = this;
  var store = stores[collectionName] = stores[collectionName] || {
    _store: [],
    _iid: 0,
    _indexes: []
  };

  self.get = function(_id, callback){
    _id = parseInt(_id);
    process.nextTick(function(){
      var idx = store._indexes.indexOf(_id);
      callback(null, store._store[idx]);
    });
  };

  self.findByField = function(field, value, callback){
    process.nextTick(function(){
      var results = [];
      store._store.forEach(function(record){
        if(record[field]===value){
          results.push(record);
        }
      });
      callback(null, results);
    });
  };

  self.count = function(callback){
    process.nextTick(function(){
      callback(null, store._store.length);
    })
  };

  self.toArray = function(offset, limit, callback){
    process.nextTick(function(){
      var records = store._store.slice(offset, offset+limit);
      callback(null, records);
    });
  };

  self.insert = function(record, callback){
    process.nextTick(function(){
      var id = record._id = store._iid++, idx = store._store.length;
      store._indexes[idx] = id;
      store._store[idx] = record;
      callback(null, record);
    });
  };

  self.delete = function(_id, callback){
    _id = parseInt(_id);
    process.nextTick(function(){
      var idx = store._indexes.indexOf(_id);
      if(idx>-1){
        store._store.splice(idx, 1);
        callback(null, 1);
      }else{
        callback(null, 0);
      }
    });
  };

  self.update = function(_id, record, callback){
    _id = parseInt(_id);
    process.nextTick(function(){
      var idx = store._indexes.indexOf(_id);
      if(idx>-1){
        store._store[idx] = record;
        record._id = _id;
        callback(null, record);
      }else{
        callback('Record with ID of '+_id+' does not exist!');
      }
    });
  };
};
