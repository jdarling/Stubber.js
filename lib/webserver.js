var express = require('express');
var config = require('../lib/config');
var fs = require('fs');
var path = require('path');
var appConfig = config.section('app', {});
var server = module.exports = express();

var webport = config.section('web', {port: 8080}).port;
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
        new Router(server, config.section('api', {route: '/api/v1/'}), express);
      }
    }
  }
  require("../lib/webdocs");
});

server.use(express.bodyParser());

server.listen(webport, function(){
  console.log('Server started on port ', webport);
});