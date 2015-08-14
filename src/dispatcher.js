import Store from './store';

export default class Dispatcher {

  constructor(debugOverride=false) {
    this.stores = [];
    this.actionHandlers = [];
    this.promises = [];
    this.dispatchQueue = [];
    this.isDispatching = false;
    this.debug = false;
  }

  getStateFromStores() {
    let state = {};
    this.stores.forEach(store => {
      let storeState = store.getState();
      Object.keys(storeState).forEach(key => {
        state[key] = storeState[key];
      });
    });
    return state;
  }

  connectAppToFlux(app) {
    this.app = app;
  }

  getStateFromStoresToApp() {
    this.getStateFromStores();
  }

  updateAppState() {
    this.app.setState(this.getStateFromStores());
  }

  debugConsole(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  register(store) {
    this.actionHandlers.push(store.actionHandler);
    this.stores.push(store);

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
                .then(callback);
            });

          } else {

            try {
              actionHandler[action.type](action);
            } catch(err) {
              reject(err);
            }

            this.debugConsole('actionHandler ' + (i + 1) + ' resolved');
            resolve();
          }

        } else {

          // Mark handler as resolved if no matching handler function for the action
          this.debugConsole('actionHandler ' + (i + 1) + ' resolved, didn\'t fire');
          resolve();
        }
      });
    });

    // Dispatch next action in dispatchQueue after all actionHandlers have been
    // resolved
    Promise.all(this.promises)
      .then(() => {

        if (!handlerHasFired) {
          throw new Error('Dispatcher: No handler fired for action type ' +
              action.type);
        }

        this.debugConsole(action.type + ': Finished');
        this.updateAppState();

        this.promises = [];
        this.isDispatching = false;
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
