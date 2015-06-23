var EventEmitter = require('events').EventEmitter,
  mixin = require('./utils').mixin;

var Store = function() {

  // Make sure the constructor-function is called with "new"-operator
  if (this instanceof Store) {
    this._data = null;
    this._backup = null;
  } else {
    return new Store();
  }
  
};

// Extend Store's prototype by mixing it with node's EventEmitter and custom methods
mixin(Store.prototype, EventEmitter.prototype, {

  constructor: Store,

  get data() {
    return this._data;
  },

  set data(data) {
    this._backup = this._data;
    this._data = data;
  },

  appendData: function(data) {
    this._backup = this._data;
    this._data.push(data);
  },

  emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }
});

module.exports = Store;