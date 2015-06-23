var Q = require('q'),
  ActionCreator = require('./action-creator'),
  Store = require('./store');

// Constructor
var Dispatcher = function () {

  // Make sure the constructor-function is called with "new"-operator
  if (this instanceof Dispatcher) {
    this._debug = false;
    this._callbacks = [];
    this._dispatchQueue = [];
    this._isDispatching = false;
    this._asyncCallbacks = [];
    this._defers = [];
    this._promises = [];
  } else {
    return new Dispatcher();
  }
  
};

// Prototype
Dispatcher.prototype = {

  register: function(callback) {
    this._callbacks.push(callback);
    this._asyncCallbacks.push(false);

    // Returns dispatchIndex for Store instance
    return this._callbacks.length - 1;
  },

  registerAsync: function(callback) {
    this._callbacks.push(callback);
    this._asyncCallbacks.push(true);

    return this._callbacks.length - 1;
  },

  dispatch: function(action) {
    this._dispatchQueue.push(action);
    if (this._debug) console.log(action.type + ': In queue');
    this._dispatchNext();
  },

  _createDone: function(defer) {
    return function(err) {
      if (err) defer.reject(err);
      else defer.resolve();
    };
  },

  _dispatchNext: function() {

    if (!this._dispatchQueue.length || this._isDispatching) return;

    this._isDispatching = true;
    var action = this._dispatchQueue.shift();
    if (this._debug) console.log(action.type + ': Dispatching');

     // Make a defer and promise for each callback to see when they're finished.
    this._callbacks.forEach(function(callback, i) {
      this._defers[i] = Q.defer();
      this._promises[i] = this._defers[i].promise;
    }.bind(this));

    // Invoke callbacks. Each callback then either fulfills or rejects corresponding deferred.
    this._callbacks.forEach(function(callback, i) {
      if (this._debug) console.log(action.type + ': starting callback' + (i+1));
      
      // Pass a done-function to the callback to be resolved, if it is registered as async
      if (this._asyncCallbacks[i]) {
        callback(action, this._createDone(this._defers[i]));
      } else {
        Q.fcall(callback, action)
          .then(this._defers[i].resolve)
          .catch(this._defers[i].reject);
      }
    }.bind(this));

    // Dispatch next action only after all callbacks have been completed.
    Q.all(this._promises)

      .catch(function(err) {
        if (this._debug) console.error(err);
        throw err;
      }.bind(this))

      .done(function() {
        if (this._debug) console.log(action.type + ': Finished');
        this._defers = [];
        this._promises = [];
        this._isDispatching = false;
        this._dispatchNext();
      }.bind(this));
    
  },

  waitFor: function(waitList, callback) {

    // Make sure waitFor is not called outside dispatching
    if (!this._isDispatching) {
      throw new Error('waitFor: Cannot be used outside dispatching');
    } else {
      if (this._debug) console.log('Started waitFor');
      
      // Get correspondig defers specified by waitList into an array
      var waitedDefers = [];
      waitList.forEach(function(waited) {

        if (waited instanceof Store) {

          if (typeof waited.dispatchIndex !== 'number') {
            throw new Error('waitFor: dispatchIndex must be a number');
          } else {
            var i = waited.dispatchIndex;
            waitedDefers.push(this._promises[i]);
          }

        } else if (typeof waited === 'number') {
          waitedDefers.push(this._promises[waited]);
        } else {
          throw new Error('waitFor: Input "' + waited + '" is not a Store instance or a number');
        }
      }.bind(this));

      // Wait for the specified defers to resolve and then call the callback
      Q.all(waitedDefers)
        .then(callback)
        .catch(function() {
          if (this._debug) console.error('waitFor: Could not execute callback, ' +
              'prerequisite callbacks did not finish');
          throw new Error('waitFor: Could not execute callback, prerequisite callbacks did not' +
              'finish');
        });
    }
  },

  newActionCreator: function() {
    return new ActionCreator(this.dispatch.bind(this));
  }

};


module.exports = Dispatcher;