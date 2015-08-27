import React from 'react';
import Dispatcher from './dispatcher';

let dispatcher;

export default {
  renderApp(App, mountPoint, initialState, stores, debug=false) {

    // Client-side rendering
    if (window !== undefined) {

      // Initialize dispatcher
      dispatcher = new Dispatcher(stores, debug);
      dispatcher.initializeStores(initialState);

      // Make actions available everywhere
      window.actionCreator = dispatcher.actions;

      // In addition to rendering, store app reference for updating app state 
      // from the dispatcher
      dispatcher.app = React.render(React.createElement(App,
        {initialState}), document.body);
    }

    // Function for rendering in server-side
    return initialState => {
      return React.renderToString(React.createElement(App, {initialState}));
    };
  },

  registerServerApiMockup(apiMockup) {
    dispatcher.apiMockup = apiMockup;
  }
};
