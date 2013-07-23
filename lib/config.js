var path = require('path');
var fs = require('fs');
var configFound = false;

var config={};
var configFile = 'config.json';
try{
  var checkSetConfig = function(dir){
    dir = path.resolve('./'+(dir||'.'));
    if(fs.existsSync(dir+'/config.json')){
      configFile = dir+'/config.json';
      configFound=true;
      return true;
    }
    return false;
  };
  if(checkSetConfig()){
  }else if(checkSetConfig('bin')){
  }else if(checkSetConfig('../bin')){
  }else{
    var l = 5, d='../';
    while((l>0)&&(!configFound)){
      if(!checkSetConfig(d)){
        d+='../';
      }
      l--;
    }
  }
  if(configFound){
    console.log('Loading config from '+configFile);
    config = require('./configloader').reader({useEnv: true, configFile: configFile});
  }else{
    console.log('No config found, using defaults.');
    config = require('./configloader').reader({useEnv: true});
  }
}catch(e){
  console.log(e);
  config = require('./configloader').reader({useEnv: true});
}
module.exports = config;