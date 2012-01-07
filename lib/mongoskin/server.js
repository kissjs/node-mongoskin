var __slice = Array.prototype.slice,
    mongodb = require('mongodb'),
    Db = mongodb.Db,
    Server = mongodb.Server,
    SkinDb = require('./db').SkinDb;

/**
 * Construct SkinServer with native Server
 *
 * @param server
 */
var SkinServer = exports.SkinServer = function(server) {
  this.server = server;
  this._cache_ = [];
};

/**
 * Create SkinDb from a SkinServer
 *
 * @param name database name
 *
 * @return SkinDb
 *
 * TODO add options
 */
SkinServer.prototype.db = function(name, username, password) {
  var key = (username || '') + '@' + name;
  var skinDb = this._cache_[key];
  if (!skinDb || skinDb.fail) {
    var db = new Db(name, this.server, {native_parser: !!mongodb.BSONNative});
    skinDb = new SkinDb(db, username, password);
    this._cache_[key] = skinDb;
  }
  return skinDb;
};
