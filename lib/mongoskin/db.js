var __slice = Array.prototype.slice,
    mongodb = require('mongodb'),
    events = require('events'),
    utils = require('./utils'),
    SkinAdmin = require('./admin').SkinAdmin,
    SkinCollection = require('./collection').SkinCollection,
    SkinGridStore = require('./gridfs').SkinGridStore,
    Db = mongodb.Db,

    STATE_CLOSE = 0,
    STATE_OPENNING = 1,
    STATE_OPEN = 2;

var _extend = function(destination, source) {
  for (var property in source) {
    destination[property] =  source[property];
  }
  return destination;
};

var SkinDb = exports.SkinDb = function(db, username, password) {
  this.db = db;
  this.username = username;
  this.password = password;
  this.state = STATE_CLOSE;
  this.emitter = new events.EventEmitter();
  this.emitter.setMaxListeners(100);
  this.admin = new SkinAdmin(this);
  this._collections = {};
  this.bson_serializer = db.bson_serializer;
  this.ObjectID = mongodb.ObjectID /* 0.9.7-3-2 */ || db.bson_serializer.ObjectID /* <= 0.9.7 */;
};

SkinDb.prototype.toObjectID = SkinDb.prototype.toId = function (hex) {
  if (hex instanceof this.ObjectID) {
    return hex;
  }
  if (!hex || hex.length !== 24) {
    return hex;
  }
  return this.ObjectID.createFromHexString(hex);
};


/**
 * retrieve native_db
 *
 * @param fn function(err, native_db)
 *
 */
SkinDb.prototype.open = function (callback) {
  switch (this.state) {

  case STATE_OPEN:
    callback && callback(null, this.db);
    return;

  case STATE_OPENNING:
    // if call 'open' method multi times before opened
    callback && this.emitter.once('open', callback);
    return;

  // case STATE_CLOSE:
  default:
    var that = this;
    var onDbOpen = function (err, db) {
      if (!err && db) {
        that.state = STATE_OPEN;
        that.db = db;
      } else {
        db = null;
        that.state = STATE_CLOSE;
      }
      that.emitter.emit('open', err, db);
    };

    callback && this.emitter.once('open', callback);
    this.state = STATE_OPENNING;

    this.db.open(function (err, db) {
      if (db && that.username) {
        // do authenticate
        db.authenticate(that.username, that.password, function (err) {
          onDbOpen(err, db);
        });
      } else {
        onDbOpen(err, db);
      }
    });
  }
};

/**
 * Cloase the db instance.
 * 
 * @param {Function(err)} callback
 * @api public
 */
SkinDb.prototype.close = function (callback) {
  if (this.state === STATE_CLOSE) {
    return callback && callback();
  } else if (this.state === STATE_OPEN) {
    this.state = STATE_CLOSE;
    this.db.close(callback);
  } else if (this.state === STATE_OPENNING) {
    var that = this;
    this.emitter.once('open', function (err, db) {
      that.state = STATE_CLOSE;
      db ? db.close(callback) : callback(err);
    });
  }
};

/**
 * Create or retrieval skin collection
 *
 * @param {String} name, the collection name.
 * @return {SkinCollection}
 * @api public
 */
SkinDb.prototype.collection = function (name) {
  var collection = this._collections[name];
  if (!collection) {
    this._collections[name] = collection = new SkinCollection(this, name);
  }
  return collection;
};

/**
 * gridfs
 */
SkinDb.prototype.gridfs = function () {
  return this.skinGridStore || (this.skinGridStore = new SkinGridStore(this));
};

/**
 * bind additional method to SkinCollection
 *
 * 1. collectionName
 * 2. collectionName, extends1, extends2,... extendsn
 * 3. collectionName, SkinCollection
 * 
 * @param {String} collectionName
 * @param {Object|SkinCollection} [options]
 * @return {SkinCollection}
 */
SkinDb.prototype.bind = function (collectionName, options) {
  var args = __slice.call(arguments);
  var name = args[0];

  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Must provide collection name to bind.');
  }
  if (args.length === 1) {
    return this.bind(name, this.collection(name));
  }
  if (args.length === 2 && args[1].constructor === SkinCollection) {
    this._collections[name] = args[1];
    Object.defineProperty(this, name, {
      value: args[1],
      writable: false,
      enumerable: true
    });
    // support bind for system.js
    var names = name.split('.');
    if (names.length > 1){
      var prev = this, next;
      for (var i = 0; i < names.length - 1; i++) {
        next = prev[names[i]];
        if (!next) {
          next = {};
          Object.defineProperty(prev, names[i], {
            value: next, 
            writable: false, 
            enumerable : true
          });
        }
        prev = next;
      }
      Object.defineProperty(prev, names[names.length - 1], {
        value: args[1], 
        writable: false, 
        enumerable : true
      });
    }
    return args[1];
  }

  var coll = this.collection(name);
  for (var index = 1, len = args.length; index < len; index++) {
    var extend = args[index];
    if (typeof extend !== 'object') {
      throw new Error('the args[' + index + '] should be object, but is `' + extend + '`');
    }
    _extend(coll, extend);
  }
  return this.bind(name, coll);
};

/**
 * Wrap mongodb
 * 
 * @param {String} name, method name
 * @param {Function} method
 * @return {Function} wrap function.
 * @api private
 */
var bindSkin = function (name, method) {
  return SkinDb.prototype[name] = function () {
    var args = __slice.call(arguments);
    if (this.state === STATE_OPEN) {
      return method.apply(this.db, args);
    }
    return this.open(function (err, db) {
      if (err) {
        utils.error(err, args, 'SkinDb.' + name);
      } else {
        return method.apply(db, args);
      }
    });
  };
};

var IGNORE_NAMES = [
  'bind', 'open', 'close', 'collection', 'admin',
  'state'
];
// bind method of mongodb.Db to SkinDb
for (var name in Db.prototype) {
  if (!name || name[0] === '_' || IGNORE_NAMES.indexOf(name) >= 0) {
    continue;
  }
  var method = Db.prototype[name];
  if (typeof method !== 'function') {
    continue;
  }
  bindSkin(name, method);
}
