App = Ember.Application.create();

App.MyCustomAdapter = DS.Adapter.create({
  find: function (store, type, id) {
    console.log('f', store);
    $.ajax({
      url:      type.url,
      dataType: 'json',
      context:  store,
      success:  function(response){
        console.log('Find: ', response);
        this.load(type, id, response.data);
      }
    });
  },
  findAll: function(store, type) {
    var resource = type.toString().split('.').pop().toLowerCase()+'s';
    $.ajax({
      url:          '/api/v1/'+resource,
      dataType: 'json',
      context:  store,
      success:  function(response){
        console.log(response);
        console.log(response[response.root]);
        this.loadMany(type, response[response.root]);
      }
    });
  }
});

App.Resource = DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string')
});

App.IndexRoute = Ember.Route.extend({
  model: function(){
    return App.Resource.find();
  }
});

App.Store = DS.Store.extend({
  revision: 13,
  adapter: 'App.MyCustomAdapter'
});

