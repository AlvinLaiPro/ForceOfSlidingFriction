var serviceWorkerOption = {
  "assets": [
    "/main.js",
    "/styles.css"
  ]
};
        
        /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var CACHE_NAME = 'forceofsliding-cache-v1';
var urlsToCache = ['/', '/ForceOfSlidingFriction/resources/images/barbg.png', '/ForceOfSlidingFriction/resources/images/celiji.png', '/ForceOfSlidingFriction/resources/images/delete-icon.png', '/ForceOfSlidingFriction/resources/images/farmar.png', '/ForceOfSlidingFriction/resources/images/farmarbig.png', '/ForceOfSlidingFriction/resources/images/glass.png', '/ForceOfSlidingFriction/resources/images/glass-btn.png', '/ForceOfSlidingFriction/resources/images/graph-bg.png', '/ForceOfSlidingFriction/resources/images/gray-icon.png', '/ForceOfSlidingFriction/resources/images/icon_choice.png', '/ForceOfSlidingFriction/resources/images/load.gif', '/ForceOfSlidingFriction/resources/images/wood.png', 'resources/images/wood-btn.png', '/ForceOfSlidingFriction/resources/images/woodblock-glass.png', '/ForceOfSlidingFriction/resources/images/woodblock-towel.png', '/ForceOfSlidingFriction/resources/images/towel.png', '/ForceOfSlidingFriction/resources/images/towel-btn.png', '/ForceOfSlidingFriction/resources/images/yellow-icon.png', '/ForceOfSlidingFriction/resources/images/yellowon-icon.png', '/ForceOfSlidingFriction/resources/images/woodblock-wood.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    console.log('opened cache');
    return cache.addAll(urlsToCache);
  }));
});

self.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request).then(function (response) {
    // Cache hit - return response
    if (response) {
      return response;
    }

    // IMPORTANT: Clone the request. A request is a stream and
    // can only be consumed once. Since we are consuming this
    // once by cache and once by the browser for fetch, we need
    // to clone the response.
    var fetchRequest = event.request.clone();

    return fetch(fetchRequest).then(function (response) {
      // Check if we received a valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // IMPORTANT: Clone the response. A response is a stream
      // and because we want the browser to consume the response
      // as well as the cache consuming the response, we need
      // to clone it so we have two streams.
      var responseToCache = response.clone();

      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, responseToCache);
      });

      return response;
    });
  }));
});

/***/ })
/******/ ]);