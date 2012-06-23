/*!
 * mongoskin - gridfs.js
 *
 * Copyright(c) 2011 - 2012 kissjs.org
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var GridStore = require('mongodb').GridStore;

/**
 * @param filename:  filename or ObjectId
 */
var SkinGridStore = exports.SkinGridStore = function(skinDb) {
  this.skinDb = skinDb;
};

/**
 * @param id
 * @param filename
 * @param mode
 * @param options
 * @param callback
 *  callback(err, gridStoreObject)
 */
SkinGridStore.prototype.open = function(id, filename, mode, options, callback){
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  this.skinDb.open(function(err, db) {
      var gs = new GridStore(db, args[0], args[1], args[2], args[3]);
      var props = {
        length: gs.length,
        contentType: gs.contentType,
        uploadDate: gs.uploadDate,
        metadata: gs.metadata,
        chunkSize: gs.chunkSize
      };
      
      gs.open(function(error, reply) {
        callback(error, reply, props);
      });
  });
}

/**
 * @param filename: filename or ObjectId
 */
SkinGridStore.prototype.unlink = SkinGridStore.prototype.remove = function(filename, callback){
  this.skinDb.open(function(err, db) {
      GridStore.unlink(db, filename, callback);
  });
}

SkinGridStore.prototype.exist = function(filename, rootCollection, callback){
  this.skinDb.open(function(err, db) {
      GridStore.exist(db, filename, rootCollection, callback);
  });
}

exports.SkinGridStore = SkinGridStore;
