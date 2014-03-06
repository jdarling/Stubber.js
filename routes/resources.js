var apiRoute = '/api/v1/';
var validator = require('../lib/validator');
var Store = require('../lib/store');
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
      records.methods = {
        listing: apiRoute+'resources',
        details: apiRoute+'resource/{{_id}}',
        create: apiRoute+'resource',
        update: apiRoute+'resource/{{_id}}',
        delete: apiRoute+'resource/{{_id}}'
      };
      if(records[records.root] instanceof Array){
        records[records.root].forEach(function(resource, index){
          records[records.root][index] = {
            _id: resource._id,
            name: resource.name
          };
        });
      }
      res.send(records);
    }
  });
};

var getResource = function(req, res, next){
  var id = (req.body||{})._id||req.params.id||req.query.id;
  req.query.filter = req.query.filter || {};
  resources.get(id||req.query, function(err, records){
    var methods = {};
    if(err){
      res.send({
        root: 'error',
        error: err
      });
    }else{
      resource = records instanceof Array?records.shift():records;
      if(resource&&resource.name){
        methods.listing = apiRoute+'stubs/'+resource.name;
        methods.schema = apiRoute+'schema/'+resource.name;
        methods.details = apiRoute+'resource/'+resource._id;
        methods.create = apiRoute+'stub/'+resource.name;
      }
      res.send({
        root: 'resource',
        resource: resource,
        methods: methods
      });
    }
  });
};

var updateResource = createResource = function(req, res, next){
  var name = (req.body||{}).name||false;
  var _id = req.params.id;
  var processRequest = function(){
    if(_id){
      delete req.body._id;
      if(req.body.name){
        req.body.name = inflection.pluralize(req.body.name).toLowerCase();
      }
      resources.update(_id, req.body, function(err, record){
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
      resources.findByField('name', req.body.name, function(err, records){
        if(err){
          return res.send({root: 'error', error: err});
        }
        if(records.length>0){
          return res.send({
            root: 'error',
            error: 'A resource with name '+req.body.name+' already exists at '+records[0]._id
          });
        }
        resources.insert(req.body, function(err, record){
          if(err){
            res.send({
              root: 'error',
              error: err
            });
          }else{
            res.send({
              root: 'resource',
              resource: record instanceof Array?record.shift():record
            });
          }
        });
      });
    }else{
      res.send({
        root: 'error',
        error: 'You must supply a name for the resource'
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
        res.send(result);
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
