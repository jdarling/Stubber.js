var parse = module.exports = function(source, vals){
  var result, keys, i, l, asArray = false, key;
  switch(typeof(source)){
    case('object'):
      keys = Object.keys(source);
      l=keys.length;
      if(source instanceof Array){
        asArray = true;
        result = new Array();
      }else{
        result = {};
      }
      for(i=0; i<l; i++){
        key = keys[i];
        if(asArray){
          result.push(parse(source[key], vals));
        }else{
          result[key] = parse(source[key], vals);
        }
      }
      return result;
      break;
    case('string'):
      return source.replace(/(\\{{|{{)(.+?)}}/gi, function(lead, match, token){
        var tokens = token.split('||');
        token = tokens.shift();
        var def = tokens.shift()||'';
        var value = vals;
        var path = token.split('.');
        var key;
        try{
          while((path.length>0)&&(!!value)){
            key = path.shift();
            value = value[key]||def;
          }
          return lead.charAt(0)==='\\'?'{{'+token+'}}':value;
        }catch(e){
          return def;
        }
      }).replace(/\`\//g, '\\');
      break;
    default:
      return source;
      break;
  }
};
