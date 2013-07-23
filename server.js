/*
if(process.env.NODE_ENV === 'production'){
  var appfog = JSON.parse(process.env.VMC_APP_INSTANCE);
  require('nodefly').profile(
      'ff78476e91e4e14e1498b3426541125a',
      ['Stewart U 360',
       appfog.name,
       appfog.instance_index]
  );
}else{
  require('nodefly').profile(
      'ff78476e91e4e14e1498b3426541125a',
      'Stewart U 360 - '+(process.env.NODE_ENV||'Development')
  );
}
*/
require('./bin/app');