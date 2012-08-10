/*!
 * mongoskin - test/utils/pedding.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

module.exports = function (n, fn) {
  var called = false;
  return function (err) {
    if (called) {
      return;
    }
    if (err) {
      called = true;
      return fn(err);
    }
    --n || fn();
  };
};
