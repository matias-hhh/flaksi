/**
This file is for building flaksi with webpack for use in browsers
**/
window.flaksi = {
  Dispatcher: require('./src/dispatcher'),
  Store: require('./src/store'),
  resource: require('./src/resource'),
  storeMixin: require('./src/store-mixin')
};