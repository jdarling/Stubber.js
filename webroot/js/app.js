/*
var view = new Ractive({
  el: '#outlet',
  template: '#loading'
});
*/

var view = false;
var helpers = 
(function(){
  var helpers = {
    JSONstringify: function(data){
      return JSON.stringify(data, null, '  ');
    },
    isComplex: function(obj){
      if(typeof(obj)==='object'){
        return true;
      }
      return false;
    },
    isHelpers: function(key){
      return !((key!=='helpers')&&(key!==helpers));
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
      var keys = Object.keys(what);
      var ret = '';
      keys.forEach(function(key){
        ret += options.fn({key: key, value: what[key]});
      });
      return ret;
    },
    getval: function(from, key, def){
      return from[key]||def||'';
    },
  };
  var key;
  for(key in Handlebars.helpers){
    helpers[key] = helpers[key] || Handlebars.helpers[key];
  }
  return helpers;
})();

var aboutPage = false;
var el = document.querySelector?function(id){
  return document.querySelector(id);
}:function(id){
  return document.getElementById(id.substr(1));
};

Array.prototype.slice.call(document.querySelectorAll('[type="text/x-template"]')).forEach(function(elem){
  if(!elem.innerHTML){
    console.log('Need to load: ', elem.getAttribute('id'));
  }else{
    try{
      Handlebars.registerPartial(elem.getAttribute('id'), elem.innerHTML);
    }catch(e){
      console.log('Error in partial "'+elem.getAttribute('id')+'"');
      throw e;
    }
  }
});

var templates = {};

var displayPage = function(pageName, data){
  var path = pageName.split('/');
  var nav = path.shift();
  var navs = document.querySelectorAll('nav li.pure-menu-selected'), i, l = navs.length||0, itm;
  var e = el('#'+pageName);
  var template = e?e.innerHTML:'';
  if(view){
    //view.teardown();
    view = false;
  }
  if(nav==='index'){
    nav = el('nav li a[href="#home"]');
  }else{
    nav = el('nav li a[href="#'+(nav||'home')+'"]');
  }

  for(i=0; i<l; i++){
    itm = navs[i];
    itm.className = itm.className.replace(/pure-menu-selected/g, '');
  }
  if(nav){
    nav = nav.parentNode;
    nav.className = (nav.className+' pure-menu-selected').trim();
  }

  if(!template){
    Loader.get('/partials/'+pageName+'.html', function(err, html){
      if(!err){
        var e = el('#'+pageName);
        if(!e){
          e = document.createElement('script');
          e.setAttribute('type', 'text/ractive');
          e.setAttribute('id', pageName);
          document.getElementsByTagName('head').item(0).appendChild(e);
        }
        e.innerHTML = html;
        displayPage(pageName, data);
      }else{
        if(err.code!==404){
          displayPage(pageName, data);
        }else{
          displayPage('pageNotFound', {
            pageName: pageName
          });
        }
      }
    });
  }else{
    /*
    if(!template.match(/\{\{\>footer\}\}/)){
      template += '{{>footer}}';
    }
    */
    data = data || {};

    var template = templates[pageName] || (templates[pageName] = Handlebars.compile(template));
    el('#outlet').innerHTML = template(data, {helpers: helpers});
    /*
    data.helpers = helpers;
    view = new Ractive({
      el: '#outlet',
      template: template,
      data: data
    });
    */
  }
};

var nav = Satnav({
  html5: false,
  force: false,
  poll: 100
});

nav
  .navigate({
    path: '/',
    directions: function(params){
      displayPage('index');
    }
  })
  .navigate({
    path: '/about',
    directions: function(params){
      if(!aboutPage){
        Loader.get('/readme.md', function(err, response){
          if(!err){
            var converter = new Showdown.converter();
            el('#about').innerHTML = aboutPage = '<div class="page">'+converter.makeHtml(response)+'</div>';
            displayPage('about');
          }
        });
      }else{
        displayPage('about');
      }
    }
  })
  .navigate({
    path: '/resources',
    directions: function(params){
      Loader.get('/api/v1/resources', function(err, resources){
        displayPage('resources', resources);
      });
    }
  })
  .navigate({
    path: '/resource/{id}',
    directions: function(params){
      Loader.get('/api/v1/resource/'+params.id, function(err, resource){
        if(err){
          return displayPage('error', err);
        }
        displayPage('resource', resource);
      });
    }
  })
  .navigate({
    path: '/resource/stubs/{name}',
    directions: function(params){
      Loader.get('/api/v1/stubs/'+params.name, function(err, stubs){
        if(err){
          return displayPage('error', err);
        }
        Loader.get('/api/v1/schema/'+params.name, function(err, schema){
          if(err){
            return displayPage('error', err);
          }
          displayPage('stubs', {stubs: stubs.items, schema: schema, segment: params.name});
      });
      });
    }
  })
  .navigate({
    path: '/resource/stub/{name}/{id}',
    directions: function(params){
      Loader.get('/api/v1/stubs/'+params.name+'/'+params.id, function(err, stub){
        if(err){
          return displayPage('error', err);
        }
        displayPage('stub', stub);
      });
    }
  })
  .navigate({
    path: '/started',
    directions: function(params){
      displayPage('started', params);
    }
  })
  .change(function(params, old){
    displayPage('loading');
    //setTimeout(function(){
      nav.resolve();
    //}, 1000);
    return this.defer;
  })
  ;

nav.otherwise('/');

nav.go();