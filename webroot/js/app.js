var handlebarsHelpers = (function(){
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
  return helpers;
})();

var aboutPage = false;
var el = function(src, sel){
  if(!sel){
    sel = src;
    src = document;
  }
  return src.querySelector(sel);
};

var els = function(src, sel){
  if(!sel){
    sel = src;
    src = document;
  }
  return Array.prototype.slice.call(src.querySelectorAll(sel));
};

(function(){
  var toLoad = 1;
  var doneLoading = function(){
    toLoad--;
    if(toLoad<1){
      setTimeout(init, 10);
    }
  };
  Array.prototype.slice.call(document.querySelectorAll('[type="text/x-template"]')).forEach(function(elem){
    var templateName = elem.getAttribute('id');
    if(!elem.innerHTML){
      toLoad++;
      Loader.get('/partials/'+templateName+'.html', function(err, template){
        doneLoading();
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
  doneLoading();
})();

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
    elem.onclick = toggleClick;
  });
};

var val = function(from){
  return from.value||from.getAttribute('value')||from.innerText||from.innerHTML;
};

var pkg = function(from){
  var result = {};
  from.forEach(function(e){
    result[e.getAttribute('name')] = val(e);
  });
  return result;
};

var linkControlls = (function(){
  var controller = false;
  var cleanupController = function(){
    delete controller;
    controller = false;
  };
  return function(pane, controllerName){
    if(controller){
      if(controller.teardown){
        controller.teardown();
      }
      cleanupController();
    }
    linkToggles();
    if(controllerName){
      controller = controllers.create(pane, controllerName);
    }
  };
})();

var ControllerNotFoundException = function(controllerName){
  var self = this;
  self.name = 'ControllerNotFoundException';
  self.message = 'Controller "'+controllerName+'" not registered';
}
ControllerNotFoundException.prototype = Object.create(Error.prototype);

var Controllers = function(){
  this._controllers = {};
};

Controllers.prototype.create = function(container, controllerName){
  var Controller = this._controllers[controllerName];
  if(!Controller){
    throw new ControllerNotFoundException(controllerName);
  }
  return new Controller(container);
};

Controllers.prototype.register = function(controllerName, controller){
  this._controllers[controllerName] = controller;
};

var controllers = new Controllers();


var ResourceController = function(container){
  var self = this;
  self.container = container;
  var submitHandler = function(e){
    var name = val(el(self.container, '[name="name"]'));
    var src = val(el(self.container, '[name="schema"]'));
    try{
      var schema = JSON.parse(src);
      var tgt = el(self.container, 'form').getAttribute('action');
      var isNew = !tgt.split('/').pop();
      console.log(tgt);
      Loader.post(tgt, {data: {name: name, schema: schema}}, function(err, response){
        if(err){
          return humane.log(err.items?err.items:err, {addnCls: 'humane-original-error'});
        }
        if(isNew){
          console.log(window.location.hash, response);
          window.location.hash = window.location.hash + '/' + response._id;
        }
        humane.log('saved');
      });
    }catch(e){
      humane.log('Inalid JSON', {addnCls: 'humane-original-error'});
    }
    e.preventDefault();
    return false;
  };
  el(container, 'button.submit').onclick = submitHandler;
};
ResourceController.prototype.teardown = function(){
  var self = this;
  (el(self.container, 'button.submit')||{}).onclick = null;
  delete self.container;
};

controllers.register('resource', ResourceController);



var StubController = function(container){
  var self = this;
  self.container = container;
  var submitHandler = function(e){
    var src = val(el(self.container, '[name="stub"]'));
    try{
      var stub = JSON.parse(src);
      var tgt = el(self.container, 'form').getAttribute('action');
      var isNew = !tgt.split('/').pop();
      Loader.post(tgt, {data: stub}, function(err, response){
        if(err){
          return humane.log(err.items?err.items:err, {addnCls: 'humane-original-error'});
        }
        if(isNew){
          console.log(window.location.hash, response);
          window.location.hash = window.location.hash + '/' + response._id;
        }
        humane.log('saved');
      });
    }catch(e){
      humane.log('Inalid JSON', {addnCls: 'humane-original-error'});
    }
    e.preventDefault();
    return false;
  };
  el(container, 'button.submit').onclick = submitHandler;
};
StubController.prototype.teardown = function(){
  var self = this;
  (el(self.container, 'button.submit')||{}).onclick = null;
  delete self.container;
};

controllers.register('stub', StubController);




var displayPage = function(pageName, data){
  var path = pageName.split('/');
  var nav = path.shift();
  var navs = document.querySelectorAll('nav li.pure-menu-selected'), i, l = navs.length||0, itm;
  var e = el('#'+pageName);
  var template = e?e.innerHTML:'';

  for(i=0; i<l; i++){
    itm = navs[i];
    itm.className = itm.className.replace(/pure-menu-selected/g, '');
  }

  if(!template){
    Loader.get('/partials/'+pageName+'.html', function(err, html){
      console.log('Lazy', pageName);
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
    if(nav==='index'){
      nav = el('nav li a[href="#home"]');
    }else{
      nav = el('nav li a[href="#'+(nav||'home')+'"]');
    }
    if(nav){
      nav = nav.parentNode;
      nav.className = (nav.className+' pure-menu-selected').trim();
    }

    var template = templates[pageName] || (templates[pageName] = Handlebars.compile(template));
    var pane = el('#outlet');
    var controllerName = e.getAttribute('data-controller');
    pane.innerHTML = template(data||{}, {helpers: handlebarsHelpers});
    linkControlls(pane, controllerName);
  }
};

var init = function(){
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
      path: '/resource',
      directions: function(params){
        displayPage('resource');
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
      path: '/resource/stub/{name}',
      directions: function(params){
        displayPage('stub', {segment: params.name});
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
};