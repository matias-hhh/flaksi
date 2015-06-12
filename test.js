var expect = require('chai').expect,
  Q = require('q'),
  Dispatcher = require('./flaksi').Dispatcher,
  Store = require('./flaksi').Store;

var dispatcher, actionCreator, storeA, storeB;

var serverApiHandler = function(action) {
  switch (action.type) {
    case 'SUCCESSFUL_SERVER_ACTION':
      return Q.fcall(function() {return {data: 'This is server data'};});
    case 'UNSUCCESFUL_SERVER_ACTION':
      return Q.fcall(function() {return {error: 'This is error'};});
  }
};

describe('Dispatcher:', function() {
  beforeEach(function() {
    dispatcher = new Dispatcher();
    // Logs dispatchers workings step by step
    dispatcher._debug = true;
    storeA = new Store();
    storeB = new Store();
  });
  describe('dispatch-method', function() {
    it('should dispatch actions one at a time in the order of invoking', function(done) {
      
      var object = {};
      var i = 0;

      dispatcher.register(function(action, next) {
        object[i] = action.type + ' callback1';
        i++;
        next();
      });

      dispatcher.register(function(action, next) {
        object[i] = action.type + ' callback2';
        i++;
        next();
        if (action.type === 'ACTION_3') {
          storeA.emit('finished');
        }
      });

      storeA.on('finished', function() {
        expect(object).to.deep.equal({
          '0': 'ACTION_1 callback1',
          '1': 'ACTION_1 callback2',
          '2': 'ACTION_2 callback1',
          '3': 'ACTION_2 callback2',
          '4': 'ACTION_3 callback1',
          '5': 'ACTION_3 callback2'
        });
        done();
      });

      dispatcher.dispatch({type: 'ACTION_1'});
      dispatcher.dispatch({type: 'ACTION_2'});
      dispatcher.dispatch({type: 'ACTION_3'});
       
    });

    it('should invoke callbacks specidied in waitFor first', function(done) {
      var object = {};
      var i = 0;

      // storeA's callback (should be invoked second)
      storeA.dispatchIndex = dispatcher.register(function(action, next) {
        dispatcher.waitFor([storeB], function() {
          object[i] = 'callback1';
          i++;
          if (dispatcher._debug) console.log('callback1 finished');
          next();
        });
      });
      // storeB's callback (should be invoked first)
      storeB.dispatchIndex = dispatcher.register(function(action, next) {
        object[i] = 'callback2';
        i++;
        if (dispatcher._debug) console.log('callback2 finished');
        next();
      });

      // Should be invoked last
      dispatcher.register(function(action, next) {
        dispatcher.waitFor([storeA], function() {
          object[i] = 'callback3';
          i++;
           if (dispatcher._debug) console.log('callback3 finished');
           next();
          storeA.emit('finished');
        });
      });

      storeA.on('finished', function() {
        expect(object).to.deep.equal({
          '0': 'callback2',
          '1': 'callback1',
          '2': 'callback3'
        });
        done();
      });

      dispatcher.dispatch({type: 'ACTION'});
      
    });
    it('Should log error to console when callback errs', function() {
      dispatcher.register(function(payload, next) {
        next(new Error('This callback erred'));
      });
      dispatcher.dispatch({type: 'ERRANEOUS_ACTION'});
    });
  });
  afterEach(function() {
    dispatcher = null;
    storeA = null;
    storeB = null;
  });
});