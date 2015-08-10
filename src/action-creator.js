import dispatcher from './dispatcher';

/**
  actionCreator
**/
let serverApiHandler, debug = false;

function debugConsole(message) {
  if (debug) {
    console.log(message);
  }
}

function registerServerApiHandler(handler) {
  serverApiHandler = handler;
}

function createViewAction(action) {
  action.source = 'VIEW';
  debugConsole('View action created with data:');
  debugConsole(action);
  dispatcher.dispatch(action);
}

function createServerAction(action) {
  if (serverApiHandler) {
    serverApiHandler(action)
      .done(
        function(actionFromApi) {
          actionFromApi.source = 'SERVER';
          debugConsole('Server action created with data:');
          debugConsole(actionFromApi);
          dispatcher.dispatch(actionFromApi);
        },
        function(err) {
          throw err;
        }
      );
  } else {
    throw new Error('ActionCreator: No serverApiHandler defined!');
  }
}

function createComboAction(action) {
  createServerAction(action);
  createViewAction(action);
}

export default Object.freeze({
  createServerAction: createServerAction,
  createViewAction: createViewAction,
  createComboAction: createComboAction,
  registerServerApiHandler: registerServerApiHandler
});
