/*!
 * mongoskin - collection.js
 *
 * Copyright(c) 2011 - 2012 kissjs.org
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

/**
  bind these methods from Collection.prototype to Provider

  methods:
    insert
    checkCollectionName
    remove
    rename
    save
    update
    distinct
    count
    drop
    findAndModify
    find
    normalizeHintField
    findOne
    createIndex
    ensureIndex
    indexInformation
    dropIndex
    dropIndexes
    mapReduce
    group
    options
*/
var __slice = Array.prototype.slice;
var events = require('events');
var Collection = require('mongodb').Collection;
var SkinCursor = require('./cursor').SkinCursor;
var utils = require('./utils');
var constant = require('./constant');
var STATE_CLOSE = constant.STATE_CLOSE;
var STATE_OPENNING = constant.STATE_OPENNING;
var STATE_OPEN = constant.STATE_OPEN;

/**
 * Construct SkinCollection from SkinDb and collectionName
 * use skinDb.collection('name') usually
 *
 * @param skinDb
 * @param collectionName
 *
 */
var SkinCollection = exports.SkinCollection = function (skinDb, collectionName) {
  this.skinDb = skinDb;
  this.ObjectID = this.skinDb.ObjectID;
  this.collectionName = collectionName;
  this.collection = null;
  this.state = STATE_CLOSE;
  this.internalHint = null;
  var that = this;
  this.__defineGetter__('hint', function () {
    return this.internalHint;
  });
  this.__defineSetter__('hint', function (value) {
    this.internalHint = value;
    this.open(function (err, collection) {
      collection.hint = value;
      that.internalHint = collection.hint;
    });
  });

  this.emitter = new events.EventEmitter();
};

for (var _name in Collection.prototype) {
  var method = Collection.prototype[_name];
  utils.bindSkin('SkinCollection', SkinCollection, 'collection', _name, method);
}

/*
 * find is a special method, because it could return a SkinCursor instance
 */
SkinCollection.prototype._find = SkinCollection.prototype.find;

/**
 * retrieve mongodb.Collection
 */
SkinCollection.prototype.open = function(fn) {
  switch (this.state) {
    case STATE_OPEN:
      return fn(null, this.collection);
    case STATE_OPENNING:
      return this.emitter.once('open', fn);
    // case STATE_CLOSE:
    default:
      var that = this;
      this.emitter.once('open', fn);
      this.state = STATE_OPENNING;
      this.skinDb.open(function (err, db) {
        if (err) {
          that.state = STATE_CLOSE;
          return that.emitter.emit('open', err, null);
        }
        db.collection(that.collectionName, function (err, collection) {
          if (collection) {
            that.state = STATE_OPEN;
            that.collection = collection;
            if (that.hint) {
              that.collection.hint = that.hit;
            }
          } else {
            that.state = STATE_CLOSE;
          }
          that.emitter.emit('open', err, collection);
        });
      });
  }
};

SkinCollection.prototype.close = function(){
  this.state = STATE_CLOSE;
};

SkinCollection.prototype.drop = function(fn) {
  this.skinDb.dropCollection(this.collectionName, fn);
  this.close();
};

/**
 * same args as find, but use Array as callback result but not use Cursor
 *
 * findItems(args, function (err, items) {});
 *
 * same as
 *
 * find(args).toArray(function (err, items) {});
 * 
 * or using `mongodb.collection.find()`
 *
 * find(args, function (err, cursor) {
 *   cursor.toArray(function (err, items) {
 *   });
 * });
 *
 */
SkinCollection.prototype.findItems = function (query, options, callback) {
  var args = __slice.call(arguments);
  var fn = args[args.length - 1];
  args[args.length - 1] = function (err, cursor) {
    if (err) {
      return fn(err);
    }
    cursor.toArray(fn);
  };
  this.find.apply(this, args);
};

/**
 * find and cursor.each(fn).
 * 
 * @param {Object} [query]
 * @param {Object} [options]
 * @param {Function(err, item)} eachCallback
 */
SkinCollection.prototype.findEach = function (query, options, eachCallback) {
  var args = __slice.call(arguments);
  var fn = args[args.length - 1];
  args[args.length - 1] = function (err, cursor) {
    if (err) {
      return fn(err);
    }
    cursor.each(fn);
  };
  this.find.apply(this, args);
};

/**
 * @deprecated use `SkinDb.toId` instead
 */
SkinCollection.prototype.id = function(hex) {
  return this.skinDb.toId(hex);
};

/**
 * Find one object by _id.
 * 
 * @param {String|ObjectID|Number} id, doc primary key `_id`
 * @param {Function(err, doc)} callback
 * @api public
 */
SkinCollection.prototype.findById = function (id, callback) {
  var args = __slice.call(arguments);
  args[0] = {_id: this.skinDb.toId(args[0])};
  this.findOne.apply(this, args);
};

/**
 * Update doc by _id.
 * @param {String|ObjectID|Number} id, doc primary key `_id`
 * @param {Function(err)} callback
 * @api public
 */
SkinCollection.prototype.updateById = function (id, callback) {
  var args = __slice.call(arguments);
  args[0] = {_id: this.skinDb.toId(args[0])};
  this.update.apply(this, args);
};

/**
 * Remove doc by _id.
 * @param {String|ObjectID|Number} id, doc primary key `_id`
 * @param {Function(err)} callback
 * @api public
 */
SkinCollection.prototype.removeById = function (id, callback) {
  var args = __slice.call(arguments);
  args[0] = {_id: this.skinDb.toId(args[0])};
  this.remove.apply(this, args);
};

/**
 * Creates a cursor for a query that can be used to iterate over results from MongoDB.
 * 
 * @param {Object} query
 * @param {Object} options
 * @param {Function(err, docs)} callback
 * @return {SkinCursor} if last argument is not a function, then returns a SkinCursor
 * @api public
 */
SkinCollection.prototype.find = function (query, options, callback) {
  var args = arguments.length > 0 ? __slice.call(arguments, 0) : [];
  if (args.length > 0 && typeof args[args.length - 1] === 'function') {
    this._find.apply(this, args);
  } else {
    return new SkinCursor(null, this, args);
  }
};