export default class Store {

  constructor(debug=false) {
    this.state = {};
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
   *  Set store state per the given state object and resolve it for the dispatcher
   *  @param {object} newState - Object containing substates
   *  @returns {object} The state that was stored in this.state
   *  @example setState({subState1: *some data here*, subState2: *more data*})
   */
  setState(newState) {

    Object.keys(newState).forEach(key => {

      // Delete the old property so the newly set object refers to a different object
      // (oldProps !== newProps)
      delete this.state[key];
      this.state[key] = newState[key];
    });

    this.debugConsole('state set');
  }

}
