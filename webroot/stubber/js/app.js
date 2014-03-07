var Application = function(){
  var self = this;
  var aboutPageLoaded = false;
  var startedPageLoaded = false;
  var partials = self.partials = new Partials({
    path: "/stubber/partials/",
    ext: ".html"
  });

  var displayPage = self.displayPage = function(pageName, data){
    var path = pageName.split('/');
    var nav = path.shift();
    var navs = document.querySelectorAll('nav li.pure-menu-selected'), i, l = navs.length||0, itm;

    for(i=0; i<l; i++){
      itm = navs[i];
      itm.className = itm.className.replace(/pure-menu-selected/g, '');
    }

    partials.get(pageName, function(err, template){
      var pane = el('#outlet');
      var controllerName = el('#'+pageName).getAttribute('data-controller');
      if(nav==='index'){
        nav = el('nav li a[href="#home"]');
      }else{
        nav = el('nav li a[href="#'+(nav||'home')+'"]');
      }
      if(nav){
        nav = nav.parentNode;
        nav.className = (nav.className+' pure-menu-selected').trim();
      }
      pane.innerHTML = template(data||{}, {helpers: handlebarsHelpers});
      linkControlls(pane, controllerName);
    });
  };

  self.init = function(){
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
        path: '/started',
        directions: function(params){
          if(!startedPageLoaded){
            Loader.get('/gettingstarted.md', function(err, response){
              if(!err){
                var converter = new Showdown.converter();
                startedPageLoaded = true;
                partials.set('started', '<div class="page">'+converter.makeHtml(response)+'</div>');
                displayPage('started');
              }
            });
          }else{
            displayPage('started');
          }
        }
      })
      .navigate({
        path: '/about',
        directions: function(params){
          if(!aboutPageLoaded){
            Loader.get('/readme.md', function(err, response){
              if(!err){
                var converter = new Showdown.converter();
                aboutPageLoaded = true;
                partials.set('about', '<div class="page">'+converter.makeHtml(response)+'</div>');
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
          displayPage('resource', {isNew: true});
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
          displayPage('stub', {segment: params.name, isNew: true});
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
};

var application = new Application();
application.partials.preload(application.init);