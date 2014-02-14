/*!
 * mongoskin - index.js
 *
 * Copyright(c) 2011 - 2012 kissjs.org
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var mongo = require('mongodb');

/*
 * exports mongo classes ObjectID Long Code DbRef ... to mongoskin
 */
for (var key in mongo) {
  exports[key] = mongo[key];
}

exports.SkinMongoClient = require('./mongo_client').SkinMongoClient;
exports.SkinDb = require('./db').SkinDb;
exports.SkinCollection = require('./collection').SkinCollection;
exports.SkinCursor = require('./cursor').SkinCursor;
exports.SkinAdmin = require('./admin').SkinAdmin;
exports.SkinGrid = require('./grid').SkinGrid;
exports.SkinGridStore = require('./grid_store').SkinGridStore;

exports.MongoClient = exports.SkinMongoClient;
exports.Db = exports.SkinDb;
exports.helper = require('./helper');

exports.db = exports.SkinMongoClient.connect;
