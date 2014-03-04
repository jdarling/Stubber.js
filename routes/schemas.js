var apiRoute = '/api/v1/';
var inflection = require('inflection');
var Store = require('../lib/store');
var resources = new Store('resources');

var getSchemaListing = function(req, res, next){
  req.query.limit = parseInt(req.query.limit, 10)||null;
  req.query.offset = parseInt(req.query.offset, 10)||null;
  resources.asArray(req.query.offset, req.query.limit, function(err, records){
    if(err){
      res.send(err);
    }else{
      console.log(records);
      var result = {
        root: 'schemas',
        schemas: [],
        limit: records.limit,
        offset: records.offset,
        count: records.count,
        length: records.length
      };
      var i, l=records.count;
      var schema, record, resourceName, name;
      for(i=0; i<l; i++){
        record = records[records.root][i];
        resourceName = inflection.singularize(record.name).toLowerCase();
        name = inflection.pluralize(record.name).toLowerCase();
        if(record.schema){
          record.schema.description = record.schema.description || record.description;
          schema = record.schema;
        }else{
          schema = {};
        }
        schema.name = resourceName;
        schema.id = 'http://'+req.headers.host+apiRoute+"schema/"+resourceName;
        result.schemas.push(schema);
      }
      res.send(result);
    }
  });
};

var getSchema = function(req, res, next){
  var resourceName = inflection.singularize(req.params.name).toLowerCase();
  var name = inflection.pluralize(req.params.name).toLowerCase();
  resources.get({name: name}, function(err, records){
    if(err){
      res.send(err);
    }else{
      var resource = (records||[]).shift()||{};
      if(resource.schema){
        resource.schema.description = resource.schema.description || resource.description;
        resource = resource.schema;
      }
      resource.name = resourceName;
      resource.id = 'http://'+req.headers.host+apiRoute+"schema/"+resourceName;
      res.send(resource);
    }
  });
};

var Router = module.exports = function(server, config, restify){
  server.get(apiRoute+'schemas', getSchemaListing);
  server.get(apiRoute+'schema/:name', getSchema);
};
