var apiRoute = '/api/v1/';
var inflection = require( 'inflection' );
var validator = require('../lib/validator');
var Store = require('../lib/store');
var resources = new Store('resources');
var stores = {};

var getStore = function(resourceType){
  var resourceCollection = inflection.pluralize(resourceType).toLowerCase();
  var store = stores[resourceCollection] = stores[resourceCollection] || new Store(resourceCollection);
  store.name = resourceCollection;
  return store;
};

var validateSchema = function(resourceType, pkt, callback){
  var resourceCollection = inflection.pluralize(resourceType).toLowerCase();
  resources.get({name: resourceCollection}, function(err, records){
    var record = (records||[]).shift();
    if(record && record.schema){
      var res = validator.validate(pkt, record.schema, function(isValid, errs){
        if(!isValid){
          var result = {
            root: 'errors',
            errors: errs,
            length: errs.length,
            count: errs.length,
            limit: errs.length,
            offset: 0
          };
          callback(result);
        }else{
          callback(null, pkt);
        }
      });
    }else{
      callback(null, pkt);
    }
  });
};

var getResourceListing = function(req, res, next){
  var resourceType = inflection.pluralize(req.params.resource).toLowerCase();
  var resourceName = inflection.singularize(resourceType).toLowerCase();
  var store = getStore(resourceType);
  req.query.limit = parseInt(req.query.limit, 10)||null;
  req.query.offset = parseInt(req.query.offset, 10)||null;
  store.asArray(req.query.offset, req.query.limit, function(err, records){
    if(err){
      return res.send(err);
    }
    records.methods = {
      schema: apiRoute+'schema/'+resourceType,
      listing: apiRoute+'stubs/'+resourceType,
      details: apiRoute+'stubs/'+resourceName+'/{{_id}}',
      create: apiRoute+'stubs/'+resourceName,
      update: apiRoute+'stubs/'+resourceName+'/{{_id}}',
      delete: apiRoute+'stubs/'+resourceName+'/{{_id}}'
    };
    res.send(records);
  });
};

var getResource = function(req, res, next){
  var resourceType = inflection.singularize(req.params.resource).toLowerCase();
  var resourceName = inflection.singularize(resourceType).toLowerCase();
  var store = getStore(resourceType);
  var id = (req.body||{})._id||req.params.id||req.query.id;
  req.query.filter = req.query.filter || {};
  store.get(id||req.query, function(err, records){
    if(err){
      return res.send(err);
    }
    var response = {root: resourceType};
    var record = response[resourceType] = records instanceof Array?records.shift():records||null;
    if(record){
      response.methods = {
        details: apiRoute+'stubs/'+resourceName+'/'+record._id,
        update: apiRoute+'stubs/'+resourceName+'/'+record._id,
        delete: apiRoute+'stubs/'+resourceName+'/'+record._id
      };
    }
    res.send(response);
  });
};

var createResource = updateResource = function(req, res, next){
  var resourceType = inflection.singularize(req.params.resource).toLowerCase();
  var resourceName = inflection.singularize(resourceType).toLowerCase();
  var store = getStore(resourceType);
  var _id = (req.body||{})._id||req.params.id||req.query.id;
  if(_id){
    (req.body||{})._id = _id;
  }
  if((req.body||{})._id){
    var id = req.body._id;
    delete req.body.id;
    req.body._lastUpdated = new Date();
    validateSchema(resourceType, req.body, function(err, record){
      if(err){
        res.send(err);
      }else{
        store.put(id, req.body, function(err, record){
          var response = {root: resourceType};
          response[resourceType] = record instanceof Array?record.shift():record;
          if(err){
            res.send({
              root: 'error',
              error: err
            });
          }else{
            record = response[response.root];
            if(response[response.root] instanceof Array){
              record = response[response.root] = response[response.root].shift();
            }
            if(record){
              response.methods = {
                details: apiRoute+'stubs/'+resourceName+'/'+record._id,
                update: apiRoute+'stubs/'+resourceName+'/'+record._id,
                delete: apiRoute+'stubs/'+resourceName+'/'+record._id
              };
            }
            res.send(response);
          }
        });
      }
    });
  }else{
    req.body._createdOn = new Date();
    req.body._lastUpdated = new Date();
    validateSchema(resourceType, req.body, function(err, record){
      if(err){
        res.send(err);
      }else{
        store.insert(req.body, function(err, record){
          if(err){
            return res.send(err);
          }
          var response = {root: resourceType};
          record = response[resourceType] = record instanceof Array?record.shift():record;
          if(record){
            response.methods = {
              details: apiRoute+'stubs/'+resourceName+'/'+record._id,
              update: apiRoute+'stubs/'+resourceName+'/'+record._id,
              delete: apiRoute+'stubs/'+resourceName+'/'+record._id
            };
          }
          res.send(response);
        });
      }
    });
  }
};

var deleteResource = function(req, res, next){
  var resourceType = inflection.singularize(req.params.resource).toLowerCase();
  var store = getStore(resourceType);
  var id = (req.body||{})._id||req.params.id||req.query.id;
  store.delete(id, function(err, numRemoved){
    res.send(err||{
      root: 'deleted',
      deleted: parseInt(numRemoved)
    });
  });
};

var Router = module.exports = function(server, config, restify){
  server.get(apiRoute+'stubs/:resource', getResourceListing);
  server.get(apiRoute+'stubs/:resource', getResourceListing);
  server.get(apiRoute+'stubs/:resource/:id', getResource);
  server.put(apiRoute+'stubs/:resource', createResource);
  server.post(apiRoute+'stubs/:resource', createResource);
  server.put(apiRoute+'stubs/:resource/:id', updateResource);
  server.post(apiRoute+'stubs/:resource/:id', updateResource);
  server.delete(apiRoute+'stubs/:resource/:id', deleteResource);
};
