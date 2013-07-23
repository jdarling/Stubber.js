var apiRoute = '/api/v1/';

var getEndpointListing = function(req, res, next){
  res.send({root: 'error', error: 'Not implemented'});
};

var Router = module.exports = function(server, config, restify){
  server.get(apiRoute+'endpoints', getEndpointListing);
};
