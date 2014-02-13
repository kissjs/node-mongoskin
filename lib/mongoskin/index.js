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

exports.MongoClient = require('./mongo_client').SkinMongoClient;
exports.Db = require('./db').SkinDb;
exports.helper = require('./helper');
