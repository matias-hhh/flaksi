/**
This file is for use with CommonJS (node.js, webpack, etc...)
**/
import Dispatcher from './src/dispatcher';
import Store from './src/store';
import resource from './src/resource';
import connectToStores from './src/connect-to-stores';
import assign from './src/assign';

export {Dispatcher, Store, resource, connectToStores, assign};
