//var restify = require('restify');
var express = require('express');
var config = require('../lib/config');
var fs = require('fs');
var path = require('path');
var appConfig = config.section('app', {
  name: 'StewartU 360 Landing Page'
});
//var server = module.exports = restify.createServer(appConfig);
var server = module.exports = express();//restify.createServer(appConfig);

var webport = process.env.VMC_APP_PORT || config.section('web', {port: 8080}).port;
var routesPath = path.resolve(appConfig.routesPath||'./routes/');

fs.readdir(routesPath, function(err, files){
  if(err){
    console.log(err);
  }else{
    var i=0, l=files.length, fileName, Router;
    var reIsJSFile = /\.js$/i;
    for(i=0; i<l; i++){
      fileName = files[i];
      if(fileName.match(reIsJSFile)){
        Router = require('../routes/'+fileName);
        new Router(server, config.section('api', {route: '/api/v1/'}), express);//restify);
      }
    }
  }
  require("../lib/webdocs");
});
/*
server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
*/
//server.use(express.acceptParser(server.acceptable));
//server.use(express.authorizationParser());
//server.use(express.dateParser());
//server.use(express.queryParser());
//server.use(express.jsonp());
//server.use(express.gzipResponse());
server.use(express.bodyParser());

server.listen(webport, function(){
  console.log('Server started on port ', webport);
});