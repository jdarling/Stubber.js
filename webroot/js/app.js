App = Ember.Application.create();

App.ResourcesAdapter = DS.StubberAdapter.create({
  namespace: '/api/v1/resources',
  identityField: '_id'
});

App.Resource = DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string')
});

App.ResourcesRoute = Ember.Route.extend({
  model: function(){
    return App.Resource.find();
  }
});

App.IndexRoute = Ember.Route.extend({
  model: function(){
    return [1, 2, 3];
  }
});

App.Router.map(function() {
  this.resource("about");
  this.resource("resources");
  this.resource("stubs");
});

App.Store = DS.Store.extend({
  revision: 13,
  adapter: 'App.ResourcesAdapter'
});

App.ShowSpinnerWhileRendering = Ember.Mixin.create({
  layout: Ember.Handlebars.compile('<div class="loading">{{ yield }}</div>'),

  classNameBindings: ['isLoaded'],

  isLoaded: function() {
    return this.get('isInserted') && this.get('controller.isLoaded');
  }.property('isInserted', 'controller.isLoaded'),

  didInsertElement: function() {
    this.set('inserted', true);
    this._super();
  }
});

App.ApplicationView = Ember.View.extend(App.ShowSpinnerWhileRendering, {
});

var converter = new Showdown.converter();

Ember.Handlebars.registerBoundHelper('showdown', function(input) {
  console.log('showdown: ', input);
  return new Handlebars.SafeString(converter.makeHtml(input));
});

Ember.Handlebars.registerBoundHelper('date', function(date) {
  return moment(date).fromNow();
});