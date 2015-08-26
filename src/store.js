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

  /*
   *  Used by dispatcher, sets resolve-function when resolving the store during
   *  the dispacthing of an action.
   */
  setResolve(resolve) {
    this.resolve = resolve;
  }

  /**
   *  Set store state per the given state object and resolve it for the dispatcher
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

    if (this.resolve) {
      this.resolve(returnedState);
    } else {
      throw new Error('Cannot set state if no resolve-function is given!');
    }

    this.resolve = undefined;
  }
}
