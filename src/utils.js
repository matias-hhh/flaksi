/**
This function is used to make mixins. First argument is the target object, and
all properties of the rest of the arguments' own properties are copied to the
target.
**/
var mixin = function() {
  for (var i = 1; i < arguments.length; i++) {
    for (var property in arguments[i]) {
      if (arguments[i].hasOwnProperty(property)) {
        arguments[0][property] = arguments[i][property];
      }
    }
  }
};

exports.mixin = mixin;