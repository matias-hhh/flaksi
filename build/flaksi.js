/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	This file is for building flaksi with webpack for use in browsers
	**/
	window.flaksi = {
	  Dispatcher: __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./src/dispatcher\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	  Store: __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./src/store\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	  resource: __webpack_require__(3),
	  storeMixin: __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./src/store-mixin\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	};

/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	exports.resource = function(method, url, data) {

	  var defer = Q.defer();

	  if (method === 'GET') {

	    request
	      .get(url)
	      .end(function(err, res) {
	        if (err) defer.reject(err);
	        else defer.resolve(res.body);
	      });

	  } else if (method === 'POST') {

	    request
	      .post(url)
	      .send(data)
	      .end(function(err, res) {
	        if (err) defer.reject(err);
	        else defer.resolve(res.body);
	      });

	  } else if (method === 'PUT') {

	    request
	      .put(url)
	      .send(data)
	      .end(function(err, res) {
	        if (err) defer.reject(err);
	        else defer.resolve(res.body);
	      });

	  } else if (method === 'DELETE') {

	    request
	      .delete(url)
	      .send(data)
	      .end(function(err, res) {
	        if (err) defer.reject(err);
	        else defer.resolve(res.body);
	      });
	  }
	  return defer.promise;
	};

/***/ }
/******/ ]);