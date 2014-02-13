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
var EventEmitter = require('events').EventEmitter;
var constant = require('./constant');
var STATE_OPEN = constant.STATE_OPEN;
var STATE_OPENNING = constant.STATE_OPENNING;
var STATE_CLOSE = constant.STATE_CLOSE;

exports.inherits = require('util').inherits;

exports.error = function (err, args, name) {
  var cb = args.pop();
  if (cb && typeof cb === 'function') {
    cb(err);
  } else {
    console.error("Error occured with no callback to handle it while calling " + name,  err);
  }
};

/**
 * SkinObject
 *
 * @constructor
 * @api public
 */
exports.SkinObject = function () {
  this.emitter = new EventEmitter();
  this.state = STATE_CLOSE;
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
      method.apply(this[nativeObjName], args);
      return this;
    }
    this.open(function (err, nativeObj) {
      if (err) {
        exports.error(err, args, objName + '.' + methodName);
      } else {
        return method.apply(nativeObj, args);
      }
    });
    return this;
  };
};

exports.makeSkinClass = function makeSkinClass(NativeClass, autoOpen) {
  var skinClassName = 'Skin' + NativeClass.name;
  function SkinClass() {
    var args = Array.property.slice.call(arguments);
    this._native = args.length > 0 ? new NativeClass.bind.apply(null, args) : null;
    this._emitter = new EventEmitter();
    this._emitter.setMaxListeners(50);
    this._state = STATE_CLOSE;
    this._init && this._init();
    if (autoOpen && this._native) {
      var self = this;
      // give some time to init the skin instance.
      process.nextTick(function () {
          self.open(function(err) {
              console.error('error to open ' + skinClassName + ' instance, args:', args, 'error:', err);
          })
      })
    }
  }

  for(var propName in NativeClass.prototype) {
    SkinClass._bind(propName);
  }

  SkinClass._bind = function(propName) {
    var fn = NativeClass.prototype[propName];
    if(typeof fn == 'function') {
      SkinClass.prototype[propName] = function() {
        var args = __slice.call(arguments);
        if (this._state == STATE_OPEN) {
          fn.apply(this._native, args);
        }
        this.open(function(err, p_native) {
            if (err) {
              exports.error(err, args, skinClassName + '.' + methodName);
            } else {
              return fn.apply(nativeObj, args);
            }
        });
        return this;
      }
    } else {
      SkinClass.prototype.__defineGetter__(propName, function() {
          return this._native[propName];
      });
      SkinClass.prototype.__defineSetter__(propName, function(value) {
          this.open(function(err, p_native) {
              if(err) return exports.error(err, args, skinClassName + '.' + propName);
              p_native[propName] = value;
          });
      });
    }
  }

  SkinClass.prototype.open = function(callback) {
    switch (this.state) {
      case STATE_OPEN:
        callback(null, this._native);
        break;
      case STATE_OPENNING:
        this._emitter.once('open', callback);
        break;
      default:
        this._emitter.once('open', callback);
        this._state = STATE_OPENNING;
        this._open(function(err, p_native) {
            if (err) {
              this._state = STATE_CLOSE;
            } else {
              this._state = STATE_OPEN;
              this._native = p_native;
            }
            this._emitter.emit('open', err, p_native);
        });
    }
    return this;
  }

  SkinClass.prototype.close = function (callback) {
    if (this._state === STATE_CLOSE) {
      callback && callback();
    } else if (this._state === STATE_OPEN) {
      this.state = STATE_CLOSE;
      this._close(callback);
    } else if (this._state === STATE_OPENNING) {
      var self = this;
      this.emitter.once('open', function (err, db) {
          self.close(callback);
      });
    }
    this._native = null;
    return this;
  }

  SkinClass.prototype._open = function(callback) {
    this._native.open(callback);
  }

  SkinClass.prototype._close = function(callback) {
    this._native.close(callback);
  }

  SkinClass.prototype.isOpen = function() {
    return this._state === STATE_OPEN;
  }

}

exports.extend = function (destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
};

exports.noop = function () {};
