var GridStore = require('mongodb').GridStore;

/**
 * @param filename:  filename or ObjectId
 */
var SkinGridStore = exports.SkinGridStore = function(skinDb) {
  this.skinDb = skinDb;
}

/**
 * @param filename: filename or ObjectId
 *  callback(err, gridStoreObject)
 */
SkinGridStore.prototype.open = function(id, filename, mode, options, callback){
  if(!callback){
    callback = options;
    options = undefined;
  }
  this.skinDb.open(function(err, db) {
      new GridStore(db, id, filename, mode, options).open(callback);
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
