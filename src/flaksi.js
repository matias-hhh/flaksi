import React from 'react';
import Dispatcher from './dispatcher';

let dispatcher;
let initialState;

export default {

  render(App, mountPoint, stores, initialStateParam, devParams={}) {

    // Client-side rendering
    if (window !== undefined) {

      initialState = initialStateParam;

      // Initialize dispatcher
      dispatcher = new Dispatcher(stores, devParams.debug);
      dispatcher.initializeStores(initialState);

      // Make actions available everywhere
      window.actionCreator = dispatcher.actions;

<<<<<<< HEAD
      // In addition to rendering, store app reference for updating app state
      // from the dispatcher
=======
      // In addition to rendering, store the app reference for updating app
      // state from the dispatcher
>>>>>>> 1739c952e9ad26bfcb81f0c062c44be72499e35e
      dispatcher.app = React.render(React.createElement(App,
        {initialState}), mountPoint);

      if (devParams.serverApiMockup) {
        dispatcher.serverApiMockup = devParams.serverApiMockup;
      }
    }

    // Function for rendering in server-side
    return initialStateParam => {
      return React.renderToString(React.createElement(App,
        {initialState: initialStateParam}));
    };
  }
};
