var __slice = Array.prototype.slice,
    mongodb = require('mongodb'),
    events = require('events'),
    SkinAdmin = require('./admin').SkinAdmin,
    SkinCollection = require('./collection').SkinCollection,
    SkinGridStore = require('./gridfs').SkinGridStore,
    Db = mongodb.Db,
    Server = mongodb.Server,

    STATE_CLOSE = 0,
    STATE_OPENNING = 1,
    STATE_OPEN = 2;

var _extend = function(destination, source) {
  for (var property in source) {
    destination[property] =  source[property];
  }
  return destination;
};

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

var SkinDb = exports.SkinDb = function(db, username, password) {
  this.db = db;
  this.username = username;
  this.password = password;
  this.state = STATE_CLOSE;
  this.emitter = new events.EventEmitter();
  this.admin = new SkinAdmin(this);
  this._collections = {};
  this.bson_serializer = db.bson_serializer;
  this.ObjectID = mongodb.ObjectID /* 0.9.7-3-2 */ || db.bson_serializer.ObjectID /* <= 0.9.7 */;
};

SkinDb.prototype.toObjectID = SkinDb.prototype.toId = function(hex) {
  if(hex instanceof this.ObjectID) {
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
SkinDb.prototype.open = function(fn) {
  switch (this.state) {

  case STATE_OPEN:
    return fn(null, this.db);

  case STATE_OPENNING:
    // if call 'open' method multi times before opened
    return this.emitter.addListener('open', fn);

  case STATE_CLOSE:
  default:
    var that = this;
    var onDbOpen = function(err, db) {
      if (!err && db) {
        that.state = STATE_OPEN;
        that.db = db;
      }else {
        db = null;
        that.state = STATE_CLOSE;
      }
      that.emitter.emit('open', err, db);
    };

    this.emitter.addListener('open', fn);
    this.state = STATE_OPENNING;

    this.db.open(function(err, db) {
      if (db && that.username) {
        //do authenticate
        db.authenticate(that.username, that.password, function(err) {
          onDbOpen(err, db);
        });
      } else {
        onDbOpen(err, db);
      }
    });
  }
};

/**
 * Close skinDb
 */
SkinDb.prototype.close = function(callback) {
  if (this.state === STATE_CLOSE) {
    return callback && callback();
  }else if (this.state === STATE_OPEN) {
    this.state = STATE_CLOSE;
    this.db.close(callback);
  }else if (this.state === STATE_OPENNING) {
    var that = this;
    this.emitter.once('open', function(err, db) {
        that.state = STATE_CLOSE;
        db.close(callback);
      });
  }
};

/**
 * create or retrieval skin collection
 */
SkinDb.prototype.collection = function(name) {
  var collection = this._collections[name];
  if (!collection) {
    this._collections[name] = collection = new SkinCollection(this, name);
  }
  return collection;
};

/**
 * gridfs
 */
SkinDb.prototype.gridfs = function() {
  return this.skinGridStore || (this.skinGridStore = new SkinGridStore(this));
}

/**
 * bind additional method to SkinCollection
 *
 * 1. collectionName
 * 2. collectionName, extends1, extends2,... extendsn
 * 3. collectionName, SkinCollection
 */
SkinDb.prototype.bind = function() {
  var args = __slice.call(arguments),
      name = args[0];

  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Must provide name parameter for bind.');
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
    if(names.length > 1){
      var prev = this, next;
      for(var i =0; i<names.length - 1; i++){
        next = prev[names[i]];
        if(!next){
          next = {};
          Object.defineProperty(prev, names[i], {
              value      : next
            , writable   : false
            , enumerable : true
          });
        }
        prev = next;
      }
      Object.defineProperty(prev, names[names.length - 1], {
          value      : args[1]
        , writable   : false
        , enumerable : true
      });
    }
    return args[1];
  }

  for (var i = 1, len = args.length; i < len; i++) {
    if (typeof args[i] != 'object')
      throw new Error('the arg' + i + ' should be object, but is ' + args[i]);
  }

  var coll = this.collection(name);
  for (var i = 0, len = args.length; i < len; i++) {
    _extend(coll, args[i]);
  }
  return this.bind(name, coll);
};

var bindSkin = function(name, method) {
  return SkinDb.prototype[name] = function() {
    var args = arguments.length > 0 ? __slice.call(arguments, 0) : [];
    return this.open(function(err, db) {
      if (err) {
        return args[args.length - 1](err);
      } else {
        return method.apply(db, args);
      }
    });
  };
};

//bind method of mongodb.Db to SkinDb
for (var name in Db.prototype) {
  var method = Db.prototype[name];
  if (name !== 'bind' && name !== 'open' && name !== 'collection' && name !== 'admin') {
    bindSkin(name, method);
  }
}

