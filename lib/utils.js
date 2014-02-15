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
var STATE_CLOSE = constant.STATE_CLOSE;
var STATE_OPENNING = constant.STATE_OPENNING;
var STATE_OPEN = constant.STATE_OPEN;

exports.inherits = require('util').inherits;

exports.error = function (err, args, name) {
  var cb = args.pop();
  if (cb && typeof cb === 'function') {
    cb(err);
  } else {
    console.error("Error occured with no callback to handle it while calling " + name,  err);
  }
};

exports.makeSkinClass = function makeSkinClass(NativeClass, autoOpen, useNativeConstructor) {
  var skinClassName = 'Skin' + NativeClass.name;
  function SkinClass() {
    var args = __slice.call(arguments);
    this._construct_args = args;
    if(useNativeConstructor && arguments.length > 0) {
      args.unshift(null);
      var ctor = NativeClass.bind.apply(NativeClass, args);
      this._native = new ctor();
    } else {
      this._native = null;
    }
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
  SkinClass._class_name = skinClassName;

  function bindSkin(propName) {
    var fn;
    var desc = Object.getOwnPropertyDescriptor(NativeClass.prototype, propName);
    if(!desc) {
      // console.log('no desc', skinClassName, propName, desc);
      try{
        fn = NativeClass.prototype[propName];
      } catch(e) {}
    } else {
      fn = desc.value;
    }
    if(typeof fn == 'function') {
      SkinClass._bindMethod(propName);
    } else if(desc) {
      if (desc.get) {
        SkinClass._bindGetter(propName);
      }
      if (desc.set) {
        SkinClass._bindSetter(propName);
      }
    } else {
      console.log('no desc and no value', skinClassName, propName);
    }
  }

  SkinClass._bindMethod = function(propName) {
    SkinClass.prototype[propName] = function() {
      var args = __slice.apply(arguments);
      if (this._state == STATE_OPEN) {
        this._native[propName].apply(this._native, args);
      } else {
        this.open(function(err, p_native) {
            if (err) {
              exports.error(err, args, skinClassName + '.' + propName);
            } else {
              p_native[propName].apply(p_native, args);
            }
        });
      }
      return this;
    }
  }

  SkinClass._bindGetter = function(propName) {
      SkinClass.prototype.__defineGetter__(propName, function() {
          return this._native && this._native[propName];// || this['_prop_' + propName];
      });
  }

  SkinClass._bindSetter = function(propName) {
      SkinClass.prototype.__defineSetter__(propName, function(value) {
          // this['_prop_' + propName] = value;
          this.open(function(err, p_native) {
              if(err) return exports.error(err, args, skinClassName + '.' + propName);
              p_native[propName] = value;
          });
      });
  }

  for(var propName in NativeClass.prototype) {
    if(propName[0] != '_') bindSkin(propName);
  }

  SkinClass.prototype.open = function(callback) {
    switch (this._state) {
      case STATE_OPEN:
        callback(null, this._native);
        break;
      case STATE_OPENNING:
        this._emitter.once('open', callback);
        break;
      default:
        this._emitter.once('open', callback);
        this._state = STATE_OPENNING;
        var self = this;
        this._open(function(err, p_native) {
            if (err) {
              self._state = STATE_CLOSE;
            } else {
              self._state = STATE_OPEN;
              self._native = p_native;
            }
            self._emitter.emit('open', err, p_native);
        });
    }
    return this;
  }

  SkinClass.prototype.close = function (callback) {
    if (this._state === STATE_CLOSE) {
      callback && callback();
    } else if (this._state === STATE_OPEN) {
      this._state = STATE_CLOSE;
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
    if(!this._native || !this._native.open) {
      console.error('No default ' + skinClassName + '._open');
      return;
    }
    this._native.open(callback);
  }

  SkinClass.prototype._close = function(callback) {
    this._native.close(callback);
  }

  SkinClass.prototype.isOpen = function() {
    return this._state === STATE_OPEN;
  }

  return SkinClass;

}

exports.extend = function (destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
};

exports.noop = function () {};
