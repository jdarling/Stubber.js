var express = require('express');
var server = require('../lib/webserver');
var config = require('../lib/config').section('web', {webroot: './webroot', indexFile: 'index.html', maxAge: 3600});
var fs = require('fs');

server.use(express.static(config.webroot));

server.get('/readme.md', function(req, res, next){
  try{
    res.send(fs.readFileSync('./readme.md').toString());
  }catch(e){
    console.log(e);
    res.send('Stubber.js\r\n==========\r\n\r\nA simple Resourcefully RESTful Stub Server.');
  }
});
