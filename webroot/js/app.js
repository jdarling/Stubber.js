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
    properCase: function(val){
      var result = val.replace( /([A-Z])/g, " $1");
      var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
      return finalResult;
    },
  };
  var key;
  for(key in Handlebars.helpers){
    helpers[key] = helpers[key] || Handlebars.helpers[key];
  }
  return helpers;
})();

var aboutPage = false;
var el = function(sel){
  return document.querySelector(sel);
};

var els = function(sel){
  return Array.prototype.slice.call(document.querySelectorAll(sel));
};

Array.prototype.slice.call(document.querySelectorAll('[type="text/x-template"]')).forEach(function(elem){
  var templateName = elem.getAttribute('id');
  if(!elem.innerHTML){
    Loader.get('/partials/'+templateName+'.html', function(err, template){
      if(err){
        return;
      }
      elem.innerHTML = template;
      Handlebars.registerPartial(templateName, template);
    });
  }else{
    try{
      Handlebars.registerPartial(templateName, elem.innerHTML);
    }catch(e){
      console.log('Error in partial "'+templateName+'"');
      throw e;
    }
  }
});

var templates = {};

var linkToggles = function(){
  var pane = el('#outlet');
  var toggles = Array.prototype.slice.call(pane.querySelectorAll('[data-toggle]'));
  var toggleClick = function(e){
      var pane = el('#outlet');
      var active = Array.prototype.slice.call(pane.querySelectorAll('[data-toggle].active'));
      var panes = Array.prototype.slice.call(pane.querySelectorAll('[data-toggle-id].active'));
      var target = this.getAttribute('data-toggle');
      active.forEach(function(active){
        active.className = active.className.replace('active', '').trim();
      });
      target = pane.querySelector('[data-toggle-id="'+target+'"]');
      panes.forEach(function(active){
        active.className = active.className.replace('active', '').trim();
      });
      this.className += ' active';
      target.className += ' active';
      e.preventDefault();
      return false;
    };
  toggles.forEach(function(elem){
    console.log(elem);
    elem.onclick = toggleClick;
  });
};

var linkPostActions = function(){
  var pane = el('#outlet');
  var actors = Array.prototype.slice.call(pane.querySelectorAll('[data-post-to]'));
  var actorClick = function(e){
      var dest = this.getAttribute('data-post-to');
      var src = pane.querySelector(this.getAttribute('data-post-src'));
      var elems = src.querySelectorAll('[name]');
      console.log(elems);
      e.preventDefault();
      return false;
    };
  actors.forEach(function(actor){
    actor.onclick = actorClick;
  });
};

var linkControlls = function(){
  linkToggles();
  linkPostActions();
};

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
    data = data || {};

    var template = templates[pageName] || (templates[pageName] = Handlebars.compile(template));
    el('#outlet').innerHTML = template(data, {helpers: helpers});
    linkControlls();
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
        displayPage('stub', {segment: params.name, stub: stub});
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
    nav.resolve();
    return this.defer;
  })
  ;

nav.otherwise('/');

nav.go();