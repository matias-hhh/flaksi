var EventEmitter = require('events').EventEmitter,
  request = require('superagent'),
  Q = require('q');

var ActionCreator = function(dispatch) {
  this.dispatch = dispatch;
};

ActionCreator.prototype.createServerAction = function(type, data) {
  if (this.serverApiHandler) {
    this.serverApiHandler({type: type, data: data})
      .then(function(apiData) {
        this.dispatch({type: type, data: apiData});
      }.bind(this))
      .catch(function(err) {
        console.error(err);
      });
  } else console.error('No serverApiHandler defined!');
};

ActionCreator.prototype.createViewAction = function (type, data) {
  this.dispatch({type: type, data: data});
};

ActionCreator.prototype.registerServerApiHandler = function(callback) {
  this.serverApiHandler = callback;
};

/*
 *  Dispatcher
 */

var Dispatcher = function () {
  this._debug = false;
  this._callbacks = [];
  this._dispatchQueue = [];
  this._isDispatching = false;
  this._defers = [];
  this._promises = [];
};

Dispatcher.prototype = {

  register: function(callback) {
    this._callbacks.push(callback);
    // Return dispatchIndex
    return this._callbacks.length - 1;
  },

  dispatch: function(action) {
    if (this._debug) console.log(action.type + ': In queue');
    this._dispatchQueue.push(action);
    this._dispatchNext();
  },

  _createResolve: function(defer) {
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

     // Make a defer and promise for each callback to handle their progressing
    this._callbacks.forEach(function(callback, i) {
      this._defers[i] = Q.defer();
      this._promises[i] = this._defers[i].promise;
    }.bind(this));

    // Invoke callbacks and pass a corresponding defer to each to be fulfilled or rejected
    this._callbacks.forEach(function(callback, i) {
      if (this._debug) console.log(action.type + ': starting callback' + (i+1));
      callback(action, this._createResolve(this._defers[i]));
    }.bind(this));

    // Dispatch next action only after all promises have resolved or rejected
    Q.all(this._promises)

      .catch(function(err) {
        if (this._debug) console.error(err);
      }.bind(this))

      .finally(function() {
        if (this._debug) console.log(action.type + ': Finished');
        this._defers = [];
        this._promises = [];
        this._isDispatching = false;
        this._dispatchNext();
      }.bind(this));
    
  },

  waitFor: function(waitList, callback) {
    if (!this._isDispatching) {
      if (this._debug) console.error('waitFor: Cannot be used outside dispatching');
    } else {
      if (this._debug) console.log('Started waitFor');
      
      // Get correspondig defers into an array
      var waitedDefers = [];
      waitList.forEach(function(waited) {
        if (waited instanceof Store) {
          if (isNaN(waited.dispatchIndex)) {
            if (this._debug) console.error('waitFor: dispatchIndex must be a number');
          } else {
            var i = waited.dispatchIndex;
            waitedDefers.push(this._promises[i]);
          }
        } else if (!isNaN(waited)) {
          waitedDefers.push(this._promises[waited]);
        } else {
          if (this._debug) console.error('waitFor: given object is not a Store instance or a number');
        }
      }.bind(this));

      // Wait for the defers to resolve and then call the callback
      Q.all(waitedDefers)
        .then(callback)
        .catch(function() {
          if (this._debug) console.error('waitFor: Could not execute callback, prerequisite callbacks did not finish');
        });
    }
  },

  newActionCreator: function() {
    return new ActionCreator(this.dispatch.bind(this));
  }

};


exports.Dispatcher = Dispatcher;

/*
 *  Store Prototype
 */
var Store = function() {};

// Inherit emitter properties
Store.prototype = Object.create(EventEmitter.prototype);

// Store Methods
Store.prototype.setData = function(data) {
  this.data = data;
};

Store.prototype.appendData = function(data) {
  this.data.push(data);
};

Store.prototype.getData = function() {
  return this.data;
};

Store.prototype.emitChange = function(data) {
  this.emit('change');
};

Store.prototype.addChangeListener = function(callback) {
  this.on('change', callback);
};

Store.prototype.removeChangeListener = function(callback) {
  this.removeListener('change', callback);
};

Store.prototype.reactApi = function() {
  return {
    getData: this.getData.bind(this),
    addChangeListener: this.addChangeListener.bind(this),
    removeListener: this.removeChangeListener.bind(this)
  };
};

exports.Store = Store;

exports.resource = function(method, url, data) {

  var defer = Q.defer();

  if (method === 'GET') {

    request
      .get(url)
      .end(function(err, res) {
        if (err) defer.reject(err);
        else defer.resolve(res.body);
      });

  } else if (method === 'POST') {

    request
      .post(url)
      .send(data)
      .end(function(err, res) {
        if (err) defer.reject(err);
        else defer.resolve(res.body);
      });

  } else if (method === 'PUT') {

    request
      .put(url)
      .send(data)
      .end(function(err, res) {
        if (err) defer.reject(err);
        else defer.resolve(res.body);
      });

  } else if (method === 'DELETE') {

    request
      .delete(url)
      .send(data)
      .end(function(err, res) {
        if (err) defer.reject(err);
        else defer.resolve(res.body);
      });
  }
  return defer.promise;
};