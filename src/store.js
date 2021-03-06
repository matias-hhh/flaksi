import assign from './assign';
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

      // Assign new data to a new reference
      if (newState[key] instanceof Array) {
        this.state[key] = [].concat(newState[key]);
      } else {
        this.state[key] = assign({}, newState[key]);
      }
    });

    this.debugConsole('state set');
  }

}
