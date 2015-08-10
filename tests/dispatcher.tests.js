import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {dispatcher, Store} from '../index';

const expect = chai.expect;

chai.use(sinonChai);


describe('Dispatcher:', function() {

  beforeEach(function() {
    dispatcher.reset();
  });

  it('should throw an error if no handlers are registered when dispatching',
      function() {
    let action = {type: 'testAction'};
    expect(dispatcher.dispatch.bind(dispatcher, action)).to.throw(Error);
  });

  it('should throw an error if no handlers fire for an action', function() {
    let action = {type: 'testAction'};
    let store = new Store();
    store.register({
      dummyAction() {}
    });
    dispatcher.dispatch({type: 'testAction', debug: true});
    expect(dispatcher.dispatch.bind(dispatcher, action)).to.throw(Error);
  });

  it('should dispatch actions one at a time in the order of dispatch calls ' +
      'when no waitFors in handlers', function(done) {

    let stores = [],
      spies = [];

    const STORE_AMOUNT = 10,
      MAX_STORE_INDEX = STORE_AMOUNT - 1,
      ACTION_AMOUNT = 10,
      MAX_ACTION_INDEX = ACTION_AMOUNT - 1;


    let createHandlerFunction = function(storeIndex, actionIndex) {
      return function() {
        spies[storeIndex][actionIndex]();

        // Final assertion if last store and last callback
        if (storeIndex === MAX_STORE_INDEX &&
            actionIndex === MAX_ACTION_INDEX) {
          for (let i = 0; i < ACTION_AMOUNT; i++) {

            for (let j = 0; j < STORE_AMOUNT; j++) {

              if (j < MAX_STORE_INDEX) {
                expect(spies[j][i]).to.have.been.calledBefore(spies[j + 1][i]);
              } else {
                expect(spies[j][i]).to.have.been.calledAfter(spies[j - 1][i]);
              }
            }
          }
          done();
        }
      };
    };

    let createActionHandler = function(storeIndex) {
        let handlers = [];

        for (let actionIndex = 0; actionIndex < ACTION_AMOUNT; actionIndex++) {
          handlers.push(createHandlerFunction(storeIndex, actionIndex));
        }

        return handlers;
      };

    // Create stores and spies, and register handlers
    for (let storeIndex = 0; storeIndex < STORE_AMOUNT; storeIndex++) {
      stores[storeIndex] = new Store();
      spies[storeIndex] = [];

      for (let actionIndex = 0; actionIndex < ACTION_AMOUNT; actionIndex++) {
        spies[storeIndex].push(sinon.spy());
      }

      stores[storeIndex].register(createActionHandler(storeIndex));
    }

    // Dispatch actions
    for (let actionIndex = 0; actionIndex < ACTION_AMOUNT; actionIndex++) {
      dispatcher.dispatch({type: actionIndex/*, debug: true*/});
    }

  });

  it('should wait for indicated store when using waitFor', function(done) {

    let storeA = new Store(),
      storeB = new Store(),
      storeASpy = sinon.spy(),
      storeBSpy = sinon.spy();

    storeA.register({
      testAction(action, waitFor) {
        waitFor([storeB], function() {
          storeASpy();

          // Mocha assertion
          expect(storeBSpy).to.have.been.calledBefore(storeASpy);
          expect(storeASpy).to.have.been.calledAfter(storeBSpy);
          done();
        });
      }
    });

    storeB.register({
      testAction() {
        storeBSpy();
      }
    });

    dispatcher.dispatch({type: 'testAction'/*, debug: true*/});

  });
});
