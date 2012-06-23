/*!
 * mongoskin - cursor.js
 *
 * Copyright(c) 2011 - 2012 kissjs.org
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var Cursor = require('mongodb').Cursor;
var utils = require('./utils');
var constant = require('./constant');
var STATE_CLOSE = constant.STATE_CLOSE;
var STATE_OPENNING = constant.STATE_OPENNING;
var STATE_OPEN = constant.STATE_OPEN;

var SkinCursor = exports.SkinCursor = function (cursor, skinCollection, args) {
  this.cursor = cursor;
  this.skinCollection = skinCollection;
  this.args = args || [];
  this.emitter = new EventEmitter();
  this.state = STATE_CLOSE;
  if (cursor) {
    this.state = STATE_OPEN;
  }
};

SkinCursor.prototype.open = function (fn) {
  switch (this.state) {
    case STATE_OPEN:
      return fn(null, this.cursor);
    case STATE_OPENNING:
      return this.emitter.once('open', fn);
    // case STATE_CLOSE:
    default:
      var that = this;
      this.emitter.once('open', fn);
      this.state = STATE_OPENNING;
      this.skinCollection.open(function (err, collection) {
        if (err) {
          that.state = STATE_CLOSE;
          that.emitter.emit('open', err);
          return;
        }
        // copy args
        var args = that.args.slice();
        args.push(function (err, cursor) {
          if (cursor) {
            that.state = STATE_OPEN;
            that.cursor = cursor;
          }
          that.emitter.emit('open', err, cursor);
        });

        collection.find.apply(collection, args);
      });
  }
};

[
  // callbacks
  'toArray', 'each', 'count', 'nextObject', 'getMore', 'explain', 
  // self return
  'sort', 'limit', 'skip', 'batchSize',
  // unsupported
  //'rewind', 'close' ,...
].forEach(function (name) {
  var method = Cursor.prototype[name];
  utils.bindSkin('SkinCursor', SkinCursor, 'cursor', name, method);
});
