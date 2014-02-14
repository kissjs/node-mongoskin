/*!
 * mongoskin - db.js
 *
 * Copyright(c) 2011 - 2012 kissjs.org
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 * TODO db.admin()
 * TODO db.gridfs()
 */

var mongodb = require('mongodb');
var Db = mongodb.Db;
var MongoClient = mongodb.MongoClient;
var utils = require('./utils');
var SkinAdmin = require('./admin').SkinAdmin;
var SkinCollection = require('./collection').SkinCollection;
var SkinGridStore = require('./gridfs').SkinGridStore;

/**
 * Constructor
 */
var SkinDb = exports.SkinDb = utils.makeSkinClass(Db, false);

SkinDb.prototype.authenticate = function () {
  this._authenticate_args = [].slice.call(arguments);
}

SkinDb.prototype._open = function(callback) {
  // TODO authenticate support
  if(this._native) {
    this._native.open(callback);
  } else if(this._connect_args) {
    var args = this._connect_args.concat(callback);
    MongoClient.connect.apply(MongoClient, args);
  }
}

/**
 * Create or retrieval skin collection
 *
 * @param {String} name, the collection name.
 * @param {Object} [options] collection options.
 * @param {Function} [callback]
 * @return {SkinCollection}
 * @api public
 */
SkinDb.prototype.collection = function (name, options, callback) {
  if(!callback && typeof options == 'function') {
    callback = options;
    options = null;
  }
  // Ooops, no findById ...
  // if(this.isOpen() && (!options || !options.strict) && !callback) {
  //   // mongodb now support collection without callback
  //   // see: http://mongodb.github.io/node-mongodb-native/api-generated/db.html#collection
  //   return this._native.collection(name, options);
  // }
  var collection = new SkinCollection();
  collection._skindb = this;
  collection._collection_args = [name, options];
  if (callback) {
    collection.open(callback);
  }
  return collection;
};

/**
 * @param {String} name the collection name
 * @param {Object} [options] collection options
 * @return {SkinCollection} collection
 */
SkinDb.prototype.bind = function (name, options) {
  return this[name] = this.collection(name, options);
}

/**
 * gridfs
 *
 * @return {SkinGridStore}
 * @api public
 */
SkinDb.prototype.gridfs = function () {
  return this.skinGridStore || (this.skinGridStore = new SkinGridStore(this));
};
