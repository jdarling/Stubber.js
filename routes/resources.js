var apiRoute = '/api/v1/';
var validator = require('../lib/validator');
var Store = require('../lib/mongostore');
var resources = new Store('resources');
var inflection = require( 'inflection' );
var jsonschema4 = require('../lib/jsonschemav4');

var getResourceListing = function(req, res, next){
  req.query.limit = parseInt(req.query.limit, 10)||null;
  req.query.offset = parseInt(req.query.offset, 10)||null;
  resources.asArray(req.query.offset, req.query.limit, function(err, records){
    if(err){
      res.send({
        root: 'error',
        error: err
      });
    }else{
      res.send(records);
    }
  });
};

var getResource = function(req, res, next){
  var id = (req.body||{})._id||req.params.id||req.query.id;
  req.query.filter = req.query.filter || {};
  resources.get(id||req.query, function(err, records){
    if(err){
      res.send({
        root: 'error',
        error: err
      });
    }else{
      res.send({
        root: 'resource',
        resource: records instanceof Array?records.shift():records
      });
    }
  });
};

var updateResource = createResource = function(req, res, next){
  var name = (req.body||{}).name||false;
  var _id = (req.body||{})._id||req.params.id||req.query.id;
  if(_id){
    (req.body||{})._id = _id;
  }
  var processRequest = function(){
    if((req.body||{})._id){
      var id = req.body._id;
      delete req.body.id;
      if(req.body.name){
        req.body.name = inflection.pluralize(req.body.name).toLowerCase();
      }
      resources.put(id, req.body, function(err, record){
        if(err){
          res.send({
            root: 'error',
            error: err
          });
        }else{
          res.send({
            root: 'resource',
            resource: record
          });
        }
      });
    }else if(name){
      req.body.name = inflection.pluralize(req.body.name).toLowerCase();
      resources.insert(req.body, function(err, record){
        if(err){
          res.send({
            root: 'error',
            error: err
          });
        }else{
          res.send({
            root: 'resource',
            resource: record
          });
        }
      });
    }else{
      res.send({
        root: 'error',
        error: "You must supply a name for the resource"
      });
    }
  };
  if((req.body||{}).schema){
    validator.validate(req.body.schema, jsonschema4, function(isValid, errs){
      if(!isValid){
        var result = {
          root: 'errors',
          errors: errs,
          length: errs.length,
          count: errs.length,
          offset: 0
        };
        callback(result);
      }else{
        processRequest();
      }
    });
  }else{
    processRequest();
  }
};

var deleteResource = function(req, res, next){
  var _id = req.params.id;
  resources.delete(_id, function(err, numRemoved){
    res.send(err||{
      root: 'deleted',
      deleted: parseInt(numRemoved)
    });
  });
};

var Router = module.exports = function(server, config, restify){
  server.get(apiRoute+'resources', getResourceListing);
  server.get(apiRoute+'resource/:id', getResource);
  server.put(apiRoute+'resource', createResource);
  server.post(apiRoute+'resource', createResource);
  server.put(apiRoute+'resource/:id', updateResource);
  server.post(apiRoute+'resource/:id', updateResource);
  server.delete(apiRoute+'resource/:id', deleteResource);
};
