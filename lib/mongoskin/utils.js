/*!
 * mongoskin - utils.js
 * 
 * Copyright(c) 2011 - 2012 kissjs.org
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var __slice = Array.prototype.slice;
var constant = require('./constant');
var STATE_OPEN = constant.STATE_OPEN;

exports.error = function (err, args, name) {
  var cb = args.pop();
  if (cb && typeof cb === 'function') {
    cb(err);
  } else {
    console.error("Error occured with no callback to handle it while calling " + name,  err);
  }
};

/**
 * Skin method binding.
 * 
 * @param {String} objName
 * @param {Function} obj
 * @param {String} nativeObjName
 * @param {String} methodName
 * @param {Function} method
 * @return {Function}
 */
exports.bindSkin = function (objName, obj, nativeObjName, methodName, method) {
  if (typeof method !== 'function') {
    return;
  }
  return obj.prototype[methodName] = function () {
    var args = __slice.call(arguments);
    if (this.state === STATE_OPEN) {
      return method.apply(this[nativeObjName], args);
    }
    return this.open(function (err, nativeObj) {
      if (err) {
        exports.error(err, args, objName + '.' + methodName);
      } else {
        return method.apply(nativeObj, args);
      }
    });
  };
};