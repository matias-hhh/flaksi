export default class Store {

  constructor(actionHandler, debug=false) {
    this.state = {};
    this.actionHandler = actionHandler;
    this.debug = debug;
  }

  debugConsole(message) {
    if (this.debug) {
      console.log('store: ' + message);
    }
  }

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

  setState(newState) {
    let returnState = {};
    Object.keys(newState).forEach(key => {

      // Delete the old property so the newly set object refers to a different object
      // (oldProps !== newProps)
      delete this.state[key];
      this.state[key] =  returnState[key] = newState[key];
    });
    this.debugConsole('state set');
    return returnState;
  }

  appendState(newStateObject) {
    let returnState = {};
    Object.keys(newStateObject).forEach(key => {
      if (this.state[key]) {
        this.state[key] = [].concat(this.state[key]);
        this.state[key].push(newStateObject[key]);
        returnState[key] = this.state[key];
      } else {
        this.state[key] = returnState[key] = [newStateObject[key]];
      }
    });
    this.debugConsole('state appended');
    return returnState;
  }

  resetState() {
    this.state = {};
  }
}
