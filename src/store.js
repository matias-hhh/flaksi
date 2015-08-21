export default class Store {

  constructor(actionHandler, debug=false) {
    this.state = {};
    this.actionHandler = actionHandler;
    this.debug = debug;
  }

  /**
   *  Logging function which logs messages to console if this.debug is set true
   */
  debugConsole(message) {
    if (this.debug) {
      console.log('store: ' + message);
    }
  }

  /**
   *  Get state from store. It can be the whole state or specified substates
   *  @param {string} ...keys
   *  @returns {Object}  1: no key specified -> return this.state
   *                     2: one key -> return this.data[key]
   *                     3: multiple keys -> return {
   *                          keys[0]: this.state[keys[0]],
   *                          keys[1]: this.state[keys[1]],
   *                          etc... 
   *                        }
   */
  getState(...keys) {
    this.debugConsole('getState called');
    if (keys.length > 0) {
      if (keys.length === 1) {
        return this.state[keys[0]];
      } else {
        let state = {};
        keys.forEach(key => {
          state[key] = this.state[key];
        });
        return state;
      }
    } else {
      return this.state;
    }
  }

  /**
   *  Set store state per the given state object
   *  @param {object} newState - Object containing substates
   *  @returns {object} The state that was stored in this.state
   *  @example setState({subState1: *some data here*, subState2: *more data*})
   */
  setState(newState) {
    let returnedState = {};
    Object.keys(newState).forEach(key => {

      // Delete the old property so the newly set object refers to a different object
      // (oldProps !== newProps)
      delete this.state[key];
      this.state[key] =  returnedState[key] = newState[key];
    });
    this.debugConsole('state set');
    return returnedState;
  }

  appendState(newStateObject) {
    let returnedState = {};
    Object.keys(newStateObject).forEach(key => {
      if (this.state[key]) {
        this.state[key] = [].concat(this.state[key]);
        this.state[key].push(newStateObject[key]);
        returnedState[key] = this.state[key];
      } else {
        this.state[key] = returnedState[key] = [newStateObject[key]];
      }
    });
    this.debugConsole('state appended');
    return returnedState;
  }

  resetState() {
    this.state = {};
  }
}
