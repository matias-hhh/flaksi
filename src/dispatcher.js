import Q from 'q';

/**
  Dispatcher
**/

// Properties
let actionHandlers = [],
  deferreds = [],
  promises = [],
  dispatchQueue = [],
  isDispatching = false,
  debug = false;

// Methods
function debugConsole(message) {
  if (debug) {
    console.log(message);
  }
}


function register(actionHandler) {
  actionHandlers.push(actionHandler);
  return actionHandlers.length - 1;
}

function dispatchNextAction() {

  if (!dispatchQueue.length || isDispatching) {
    return;
  }

  isDispatching = true;
  let action = dispatchQueue.shift();
  if (action.debug) {
    debug = true;
  }
  debugConsole(action.type + ' (source: ' + action.source + ')' + ': Dispatching');

  // Make a deferred and store its promise for each actionHandler so that we will
  // know when they all finish and next action will be dispatched
  actionHandlers.forEach((actionHandler, i) => {
    deferreds[i] = Q.defer();
    promises.push(deferreds[i].promise);
  });

  let handlerHasFired = false;

  // Invoke actionHandlers. Each actionHandler either fulfills or rejects it's
  // deferred
  actionHandlers.forEach((actionHandler, i) => {
    debugConsole(action.type + ': Invoking actionHandler ' + (i + 1));

    if (actionHandler[action.type] !== undefined) {

      handlerHasFired = true;

      // If waitFor is needed (indicated by requiring two parameters) pass
      // it to the handler as the second parameter
      if (actionHandler[action.type].length === 2) {
        actionHandler[action.type](action, createWaitFor(i));

      // Else just resolve synchronicly with Q.fcall
      } else {
        Q.fcall(actionHandler[action.type], action)
          .then(() => {
            debugConsole('actionHandler ' + (i + 1) + ' resolved');
            deferreds[i].resolve();
          })
          .catch(err => {
            deferreds[i].reject(err);
          });
      }
    } else {

      // Mark handler as resolved if no matching handler function for the action
      debugConsole('actionHandler ' + (i + 1) + ' resolved, didn\'t fire');
      deferreds[i].resolve();
    }
  });

  // Dispatch next action in dispatchQueue after all actionHandlers have been
  // resolved
  Q.all(promises)
    .done(
      () => {

        if (!handlerHasFired) {
          throw new Error('Dispatcher: No handler fired for action type ' +
              action.type);
        }

        debugConsole(action.type + ': Finished');
        promises = [];
        isDispatching = false;
        debug = false;
        dispatchNextAction();
      },
      err => {
        debugConsole(err);
        throw err;
      }
    );

}

function dispatch(action) {
  dispatchQueue.push(action);

  if (action.debug) {
    debug = true;
  }

  if (actionHandlers.length === 0) {
    throw new Error('Dispatcher: No handlers registered');
    console.log('ERROR');
  }

  debugConsole(action.type + ': In queue');
  dispatchNextAction();
}

function createWaitFor(handlerIndex) {

  return function(waitList, callback) {

    // Check that waitFor is not called outside dispatching
    if (!isDispatching) {
      throw new Error('waitFor: Cannot be used outside dispatching');
    } else {
      debugConsole('Started waitFor');
    }

    let waitedPromises = [];

    // Get deferreds from waited actionHandlers
    waitList.forEach(waited => {

      if (typeof waited.dispatchToken !== undefined) {
        waitedPromises.push(promises[waited.dispatchToken]);

      } else if (typeof waited === 'number') {
        waitedPromises.push(promises[waited]);

      } else {
        throw new Error('waitFor: Parameter is not a list of stores or numbers');
      }
    });

    // Wait for the specified deferreds to resolve, then invoke the callback
    Q.all(waitedPromises)
      .done(
        () => {
          callback();
          debugConsole('ActionHandler ' + (handlerIndex + 1) + ' resolved');
          deferreds[handlerIndex].resolve();
        },
        err => {
          debugConsole('waitFor: Could not execute callback, waited' +
              'actionHandlers did not finish');
          debugConsole(err);
        }
      );
  };
}


function reset() {
  actionHandlers = [];
  deferreds = [];
  promises = [];
  dispatchQueue = [];
  isDispatching = false;
  debug = false;
}

// Public methods
export default Object.freeze({
  register,
  dispatch,
  reset
});
