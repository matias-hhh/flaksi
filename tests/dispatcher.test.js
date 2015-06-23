var chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  Dispatcher = require('./src/dispatcher'),
  Store = require('./src/store');

var expect = chai.expect;
chai.use(sinonChai);

var dispatcher, actionCreator, storeA, storeB;

describe('Dispatcher:', function() {
  beforeEach(function() {
    dispatcher = new Dispatcher();
    // Logs dispatchers workings step by step
    dispatcher._debug = true;
    storeA = new Store();
    storeB = new Store();
    storeC = new Store();
  });
  describe('dispatch-method', function() {
    it('should dispatch actions one at a time in the order of invoking', function(done) {
      
      var storeASpyA1 = sinon.spy(),
        storeASpyA2 = sinon.spy(),
        storeBSpyA1 = sinon.spy(),
        storeBSpyA2 = sinon.spy();

      storeA.dispatchIndex = dispatcher.register(function(action) {
        if (action.type === 'ACTION_1') {
          storeASpyA1();
        } else if (action.type === 'ACTION_2') {
          storeASpyA2();
        }
      });

      storeB.dispatchIndex = dispatcher.register(function(action) {
        if (action.type === 'ACTION_1') {
          storeBSpyA1();
        } else if (action.type === 'ACTION_2') {
          storeBSpyA2();
          storeB.emit('finished');
        }
      });

      storeB.on('finished', function() {
        expect(storeASpyA1).to.have.been.calledBefore(storeBSpyA1);
        expect(storeBSpyA1).to.have.been.calledBefore(storeASpyA2);
        expect(storeASpyA2).to.have.been.calledBefore(storeBSpyA2);
        expect(storeBSpyA2).to.have.been.calledAfter(storeASpyA2);
        done();
      });

      dispatcher.dispatch({type: 'ACTION_1'});
      dispatcher.dispatch({type: 'ACTION_2'});
      
    });

    it('should handle waitFors as expected', function(done) {
      
      var storeASpy = sinon.spy(),
        storeBSpy = sinon.spy(),
        storeCSpy = sinon.spy();

      // storeA's callback (should be invoked second)
      storeA.dispatchIndex = dispatcher.registerAsync(function(action, done) {
        dispatcher.waitFor([storeB], function() {
          storeASpy();
          if (dispatcher._debug) console.log('storeA finished');
          done();
        });
      });
      // storeB's callback (should be invoked first)
      storeB.dispatchIndex = dispatcher.register(function(action) {
        storeBSpy();
        if (dispatcher._debug) console.log('storeB finished');
      });

      // storeC's callback (should be invoked last)
      storeC.dispatchIndex = dispatcher.registerAsync(function(action, done) {
        dispatcher.waitFor([storeA], function() {
          storeCSpy();
          if (dispatcher._debug) console.log('storeC finished');
          done();
          storeC.emit('finished');
        });
      });

      storeC.on('finished', function() {
        expect(storeBSpy).to.have.been.calledBefore(storeASpy);
        expect(storeASpy).to.have.been.calledBefore(storeCSpy);
        expect(storeCSpy).to.have.been.calledAfter(storeASpy);
        done();
      });

      dispatcher.dispatch({type: 'ACTION'});
      
    });
    it('Should log error to console when callback errs', function() {
      dispatcher.register(function(action) {
        throw new Error('This callback erred');
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