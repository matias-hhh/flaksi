import assign from './assign';
import resource from './resource';

export default class Dispatcher {

  constructor(stores, debug=false) {
    this.actions = {};
    this.promises = [];
    this.dispatchQueue = [];
    this.isDispatching = false;
    this.debug = debug;
    this.stores = [];

    stores.forEach(Store => {
      this.stores.push(Store);

      // Read action handler names from stores and make properties with same
      // names to this.actions and assign a triggerAction function for each
      Object.getOwnPropertyNames(Store.prototype).forEach(name => {
        if (name !== 'constructor' && this.actions[name] === undefined) {
          this.actions[name] = this.createTriggerAction(name);
        }
      });
    });

  }

  debugConsole(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  initializeStores(initialState) {
    this.stores = this.stores.map(Store => {
      let store = new Store(initialState, true);
      return store;
    });
  }

  createTriggerAction(type) {
    return data => {

      // Create "quite" unique transaction id for rollback
      let transactionId = Date.now() + '+' + Math.random();

      if (data) {
        if (data.view || data.both) {
          let action = assign({type, transactionId, source: 'view'}, data.view,
            data.both);
          this.dispatch(action);
        }

        if (data.server) {

          // Shape the object sent to the server
          let apiData = assign({}, data.both, data.server);
          delete apiData.method;
          delete apiData.url;

          // Use mockup apiCaller if one is defined
          let apiCaller;

          if (this.apiMockup) {
            apiCaller = this.apiMockup;
          } else {
            apiCaller = resource;
          }

          apiCaller(data.server.method, data.server.url, apiData)
            .then(result => {
              let action = assign({type, transactionId, source: 'server'},
                result);
              if (apiData.debug) { assign(action, {debug: true}); }
              this.dispatch(action);
            })
            .catch(err => {
              let action = {type, transactionId, source: 'server', error: err};
              if (apiData.debug) { assign(action, {debug: true}); }
              this.dispatch(action);
            });
        }
      } else {
        this.dispatch({type});
      }
    };
  }

  dispatch(action) {
    this.dispatchQueue.push(action);

    if (this.stores.length === 0) {
      throw new Error('Dispatcher: No stores registered');
    }

    this.debugConsole(action.type + ': In queue');
    this.dispatchNext();
  }

  dispatchNext() {

    if (!this.dispatchQueue.length || this.isDispatching) {
      return;
    }

    this.isDispatching = true;

    let action = this.dispatchQueue.shift();

    this.debugConsole(action.type + ' (source: ' + action.source + ')' +
      ': Dispatching');

    let storeHasFired = false;

    this.stores.forEach((store, i) => {

      // Make a promise for each store so we can see when all stores
      // have resolved
      this.promises[i] = new Promise((resolve, reject) => {
        this.debugConsole(action.type + ': Invoking actionHandler ' + (i + 1));

        if (store[action.type] !== undefined) {

          storeHasFired = true;

          // Pass a callback to the store to receive it's state
          let stateFromStore;
          store.getStateWithCallback(state => {
            stateFromStore = state;
          });

          // Call the store's action handler
          try {
            store[action.type].call(store, action);
          } catch(err) {
            reject(err);
            return;
          }
          
          resolve(stateFromStore);
          

        } else {

          // Mark store as resolved if no matching handler function found for the
          // action
          this.debugConsole(action.type + ': store ' + (i + 1) +
            ' resolved, didn\'t fire');
          resolve();
        }
      });
    });

    // Update app state and dispatch next action after all stores have been
    // resolved
    Promise.all(this.promises)
      .then((stateArray) => {

        if (!storeHasFired) {
          throw new Error('Dispatcher: No store fired for action type ' +
              action.type);
        }

        this.debugConsole(action.type + ': Finished');

        // Make a state object from all the states from individual stores
        let stateFromStores = {};
        stateArray.forEach(state => {
          assign(stateFromStores, state);
        });

        // Update app's state
        this.app.setState(stateFromStores);

        this.promises = [];
        this.isDispatching = false;

        this.dispatchNext();
      })

      .catch(err => {
          console.error(err);
        }
      );
  }

}
