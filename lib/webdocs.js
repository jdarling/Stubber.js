var express = require('express');
var server = require('../lib/webserver');
var config = require('../lib/config').section('web', {webroot: './webroot', indexFile: 'index.html', maxAge: 3600});

server.use(express.static(config.webroot));
