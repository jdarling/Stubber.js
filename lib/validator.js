var tv4 = require('tv4').tv4;
//var JaySchema = require('jayschema');
//var js = new JaySchema();

var validator = module.exports.validate = function(instance, schema, callback){
//*
  // tv4
  var result = tv4.validateMultiple(instance, schema);
  callback(result.valid, result.errors);
//*/
/*
  // JaySchema
  var res = js.validate(instance, schema);
  callback(!res, res);
//*/
};
