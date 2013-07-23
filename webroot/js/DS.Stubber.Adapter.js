DS.Adapter.create({
  find: function (store, type, id) {
    $.ajax({
      url:      type.url,
      dataType: 'jsonp',
      context:  store,
      success:  function(response){
        console.log('Find: ', response);
        this.load(type, id, response.data);
      }
    });
  },
  findAll: function(store, type) {
    $.ajax({
      url:      type.url,
      dataType: 'jsonp',
      context:  store,
      success:  function(response){
        console.log('Find all: ', response);
        this.loadMany(type, response.data);
      }
    });
  }
});