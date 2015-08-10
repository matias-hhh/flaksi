/**
This file is for use with CommonJS (node.js, webpack, etc...)
**/
import dispatcher from './src/dispatcher';
import Store from './src/store';
import resource from './src/resource';
import connectToStores from './src/connect-to-stores';
import actionCreator from './src/action-creator';
import assign from './src/assign';

export {dispatcher, Store, resource, connectToStores, actionCreator, assign};
