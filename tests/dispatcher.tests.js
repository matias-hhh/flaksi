import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Dispatcher, Store} from '../index';

const expect = chai.expect;

chai.use(sinonChai);

const dispatcher = new Dispatcher();

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
    let store = dispatcher.createStore({
      dummyAction() {}
    });
    dispatcher.dispatch({type: 'testAction', debug: true});
    expect(dispatcher.dispatch.bind(dispatcher, action)).to.throw(Error);
  });

  it('should dispatch actions one at a time in the order of dispatch calls ',
      function(done) {

    let spies = [];

    const HANDLER_AMOUNT = 10,
      MAX_HANDLER_INDEX = HANDLER_AMOUNT - 1,
      ACTION_AMOUNT = 10,
      MAX_ACTION_INDEX = ACTION_AMOUNT - 1;


    let createHandlerFunction = function(handlerIndex, actionIndex) {
      return function() {
        spies[handlerIndex][actionIndex]();

        // Final assertion if last store and last callback
        if (handlerIndex === MAX_HANDLER_INDEX &&
            actionIndex === MAX_ACTION_INDEX) {
          for (let i = 0; i < ACTION_AMOUNT; i++) {

            for (let j = 0; j < HANDLER_AMOUNT; j++) {

              if (j < MAX_HANDLER_INDEX) {
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

    let createActionHandler = function(handlerIndex) {
        let handlers = [];

        for (let actionIndex = 0; actionIndex < ACTION_AMOUNT; actionIndex++) {
          handlers.push(createHandlerFunction(handlerIndex, actionIndex));
        }

        return handlers;
      };

    // Crate spies and register handlers
    for (let handlerIndex = 0; handlerIndex < HANDLER_AMOUNT; handlerIndex++) {
      spies[handlerIndex] = [];

      for (let actionIndex = 0; actionIndex < ACTION_AMOUNT; actionIndex++) {
        spies[handlerIndex].push(sinon.spy());
      }

      dispatcher.register(createActionHandler(handlerIndex));
    }

    // Dispatch actions
    for (let actionIndex = 0; actionIndex < ACTION_AMOUNT; actionIndex++) {
      dispatcher.dispatch({type: actionIndex/*, debug: true*/});
    }

  });
});
