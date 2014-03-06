(function(global){
  var helpers = global.handlebarsHelpers = {
    JSONstringify: function(data){
      return JSON.stringify(data, null, '  ');
    },
    isComplex: function(obj){
      if(typeof(obj)==='object'){
        return true;
      }
      return false;
    },
    notPrivate: function(data, options){
      var res = {}, key;
      for(key in data){
        if(key.substr(0,1)!=='_'){
          res[key] = data[key];
        }
      }
      return options.fn(res);
    },
    keys: function(what, options){
      return options.fn(Object.keys(what));
    },
    eachkeys: function(what, options){
      var keys = Object.keys(what||{});
      var ret = '';
      keys.forEach(function(key){
        ret += options.fn({key: key, value: what[key]});
      });
      return ret;
    },
    getval: function(from, key, def){
      return from[key]||def||'';
    },
    properCase: function(val){
      var result = (val||'').replace( /([A-Z])/g, " $1");
      var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
      return finalResult;
    },
  };
  var key;
  for(key in Handlebars.helpers){
    helpers[key] = helpers[key] || Handlebars.helpers[key];
  }
})(this);