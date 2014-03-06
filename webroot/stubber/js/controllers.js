var controllers = new Controllers();

var ResourceController = function(container){
  var self = this;
  var btnDelete = el(container, '#delete')||{};
  self.container = container;
  var submitHandler = function(e){
    var name = val(el(self.container, '[name="name"]'));
    var src = val(el(self.container, '[name="schema"]'));
    try{
      var schema = JSON.parse(src);
      var tgt = el(self.container, 'form').getAttribute('action');
      var isNew = !tgt.split('/').pop();
      Loader.post(tgt, {data: {name: name, schema: schema}}, function(err, response){
        if(err){
          return humane.log(err.items?err.items:err, {addnCls: 'humane-original-error'});
        }
        if(isNew){
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
  var switchMode = function(){
    var editing = !!this.checked;
    var pane = self.container;
    var panes = els(pane, '[data-toggle-id].active');
    var target = editing?'edit':'view';
    target = pane.querySelector('[data-toggle-id="'+target+'"]');
    panes.forEach(function(active){
      active.className = active.className.replace('active', '').trim();
    });
    target.className += ' active';
  };
  var deleteResource = function(e){
    var dest = this.getAttribute('data-after');
    var api = this.getAttribute('data-delete');
    Loader.delete(api, function(){
      window.location.hash = dest;
    });
    e.preventDefault();
    return false;
  };
  el(container, 'button.submit').onclick = submitHandler;
  el(container, '#editing').onchange = switchMode;
  btnDelete.onclick = deleteResource;
};
ResourceController.prototype.teardown = function(){
  var self = this;
  (el(self.container, 'button.submit')||{}).onclick = null;
  delete self.container;
};

controllers.register('resource', ResourceController);



var StubController = function(container){
  var self = this;
  var btnDelete = el(container, '#delete')||{};
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
  var switchMode = function(){
    var editing = !!this.checked;
    var pane = self.container;
    var panes = els(pane, '[data-toggle-id].active');
    var target = editing?'edit':'view';
    target = pane.querySelector('[data-toggle-id="'+target+'"]');
    panes.forEach(function(active){
      active.className = active.className.replace('active', '').trim();
    });
    target.className += ' active';
  };
  var deleteStub = function(e){
    var dest = this.getAttribute('data-after');
    var api = this.getAttribute('data-delete');
    Loader.delete(api, function(){
      window.location.hash = dest;
    });
    e.preventDefault();
    return false;
  };
  el(container, 'button.submit').onclick = submitHandler;
  el(container, '#editing').onchange = switchMode;
  btnDelete.onclick = deleteStub;
};
StubController.prototype.teardown = function(){
  var self = this;
  (el(self.container, 'button.submit')||{}).onclick = null;
  delete self.container;
};

controllers.register('stub', StubController);

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
    if(controllerName){
      controller = controllers.create(pane, controllerName);
    }
  };
})();