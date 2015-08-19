import assign from './assign';
import resource from './resource';

import testPostDetailsData from '../../../test-post-details-data';

export default class Dispatcher {

  constructor() {
    this.actionHandlers = [];
    this.actions = {};
    this.promises = [];
    this.dispatchQueue = [];
    this.isDispatching = false;
    this.stateFromAction = {};
    this.debug = false;
  }

  debugConsole(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  connectAppToFlux(app) {
    this.app = app;
  }

  initializeStores(initialState) {
    this.initialState = initialState;
    let action = assign({type: 'initializeStores'}, initialState);
    this.dispatch(action);
  }

  getInitialState() {
    return this.initialState;
  }

  triggerAction(type) {
    return data => {

      // Create "quite" unique transaction id for rollback
      let transactionId = Date.now() + '+' + Math.random();
      console.log(transactionId);

      if (data) {
        if (data.view || data.both) {
          let action = assign({type, transactionId, source: 'view'}, data.view,
            data.both);
          console.log(action);
          this.dispatch(action);
        }

        if (data.server) {

          setTimeout(() => {
            this.dispatch({
              type,
              transactionId,
              source: 'server',
              post: testPostDetailsData.post,
              comments: testPostDetailsData.comments
            });
          }, 1000);

          /*let apiData = assign({}, data.both, data.server)

          delete apiData.method;
          delete apiData.url;

          resource(method, url, data.server)
            .then(result => {
              let action = assign({type, transactionId, source: 'server'},
                result);
              this.dispatch(action);
            })
            .catch(err => {
              let action = {type, transactionId, source: 'server', error: err};
              this.dispatch(action);
            });*/
        }
      } else {
        this.dispatch({type});
      }
    };
  }

  registerStore(store) {

    // Register actionHandler
    this.actionHandlers.push(store.actionHandler);

    // Find out the actions the store is waiting for and store them in
    // this.actions
    Object.keys(store.actionHandler).forEach(key => {
      if (!this.actions[key]) {
        this.actions[key] = this.triggerAction(key);
      }
    });

    // Set dispatchToken
    store.dispatchToken = this.actionHandlers.length - 1;
  }

  register(stores) {

    if (Object.prototype.toString.call(stores) === '[object Array]') {
      stores.forEach(store => {
        this.registerStore(store);
      });

    } else {
      this.registerStore(stores);
    }
  }

  getActions() {
    return this.actions;
  }

  dispatchNext() {

    if (!this.dispatchQueue.length || this.isDispatching) {
      return;
    }

    this.isDispatching = true;

    let action = this.dispatchQueue.shift();

    if (action.debug) {
      this.debug = true;
    }

    this.debugConsole(action.type + ' (source: ' + action.source + ')' +
      ': Dispatching');

    let handlerHasFired = false;

    // Make a promise for each actionHandler so we can see when all handlers
    //are resolved
    this.actionHandlers.forEach((actionHandler, i) => {
      this.promises[i] = new Promise((resolve, reject) => {

        this.debugConsole(action.type + ': Invoking actionHandler ' + (i + 1));

        if (actionHandler[action.type] !== undefined) {

          handlerHasFired = true;

          // If two parameters requested in handler, make waitFor the second
          // parameter
          if (actionHandler[action.type].length === 2) {

            actionHandler[action.type](action, (waitedStores, callback) => {
              let waitedPromises = [];

              waitedStores.forEach(store => {
                waitedPromises.push(this.promises[store.dispatchToken]);
              });

              Promise.all(waitedPromises)
                .then(() => {
                  // Resolve only if callback returns something
                  let stateFromHandler = callback();

                  if (stateFromHandler) {
                    assign(this.stateFromAction, stateFromHandler);
                    resolve();
                  }

                });
            });

          } else {

            try {
              let stateFromHandler = actionHandler[action.type](action);
              if (stateFromHandler) {
                assign(this.stateFromAction, stateFromHandler);
              }
            } catch(err) {
              this.debugConsole(action.type + ': ERROR: actionHandler ' +
                (i + 1) + ' rejected');
              reject(err);
              return;
            }

            this.debugConsole(action.type + ': actionHandler ' + (i + 1) +
              ' resolved');
            resolve();
          }

        } else {

          // Mark handler as resolved if no matching handler function for the
          // action
          this.debugConsole(action.type + ': actionHandler ' + (i + 1) +
            ' resolved, didn\'t fire');
          resolve();
        }
      });
    });

    // Update app state and dispatch next action after all handlers have been
    // resolved
    Promise.all(this.promises)
      .then(() => {

        if (!handlerHasFired) {
          throw new Error('Dispatcher: No handler fired for action type ' +
              action.type);
        }

        this.debugConsole(action.type + ': Finished');

        // Update changed state to app
        if (this.stateFromAction) {
          this.app.setState(this.stateFromAction);
        }

        this.promises = [];
        this.isDispatching = false;
        this.stateFromAction = [];
        this.debug = false;

        this.dispatchNext();
      })

      .catch(err => {
          this.debugConsole(err);
        }
      );
  }

  dispatch(action) {
    this.dispatchQueue.push(action);

    if (action.debug) {
      this.debug = true;
    }

    if (this.actionHandlers.length === 0) {
      throw new Error('Dispatcher: No handlers registered');
    }

    this.debugConsole(action.type + ': In queue');
    this.dispatchNext();
  }

  reset() {
    this.actionHandlers = [];
    this.promises = [];
    this.dispatchQueue = [];
    this.isDispatching = false;
    this.debug = false;
  }
}
