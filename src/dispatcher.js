import assign from './assign';

export default class Dispatcher {

  constructor() {
    this.actionHandlers = [];
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
    let action = assign({type: 'initializeStores'}, initialData);
    this.dispatch(action);
  }

  getInitialState() {
    return this.initialState;
  }

  register(store) {
    this.actionHandlers.push(store.actionHandler);

    // Set dispatchToken
    store.dispatchToken = this.actionHandlers.length - 1;
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

    this.debugConsole(action.type + ' (source: ' + action.source + ')' + ': Dispatching');

    let handlerHasFired = false;

    // Make a promise for each actionHandler so we can see when all handlers are resolved
    this.actionHandlers.forEach((actionHandler, i) => {
      this.promises[i] = new Promise((resolve, reject) => {

        this.debugConsole(action.type + ': Invoking actionHandler ' + (i + 1));

        if (actionHandler[action.type] !== undefined) {

          handlerHasFired = true;

          // If two parameters requested in handler, make waitFor the second parameter
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
              this.debugConsole(action.type + ': ERROR: actionHandler ' + (i + 1) + ' rejected');
              reject(err);
              return;
            }

            this.debugConsole(action.type + ': actionHandler ' + (i + 1) + ' resolved');
            resolve();
          }

        } else {

          // Mark handler as resolved if no matching handler function for the action
          this.debugConsole(action.type + ': actionHandler ' + (i + 1) + ' resolved, didn\'t fire');
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
