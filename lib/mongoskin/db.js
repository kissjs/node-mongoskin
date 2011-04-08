var __slice = Array.prototype.slice,
    mongo = require('mongodb'),
    events = require('events'),
    SkinAdmin = require('./admin').SkinAdmin,
    SkinCollection = require('./collection').SkinCollection,
    Db = mongo.Db,
    Server = mongo.Server,

    STATE_CLOSE = 0,
    STATE_OPENNING = 1,
    STATE_OPEN = 2;

var _extend = function(destination, source) {
  var property, value;
  for (property in source) {
    value = source[property];
    destination[property] = value;
  }
  return destination;
};

var SkinServer = exports.SkinServer = function(server) {
  this.server = server;
  this._cache_ = [];
};

SkinServer.prototype.db = function(name, username, password) {
  var key = (username || '') + '@' + name;
  var skinDb = this._cache_[key];
  if (!skinDb || skinDb.fail) {
    var db = new Db(name, this.server, {native_parser: BSONNative !== undefined});
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
};

SkinDb.prototype.open = function(fn) {
  switch (this.state) {

  case STATE_OPEN:
    return fn(null, this.db);

  case STATE_OPENNING:
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
      return that.emitter.emit('open', err, db);
    };

    this.emitter.addListener('open', fn);
    this.state = STATE_OPENNING;

    return this.db.open(function(err, db) {
      if (db && that.username) {
        //do authenticate
        return db.authenticate(that.username, that.password, function(err) {
          return onDbOpen(err, db);
        });
      } else {
        return onDbOpen(err, db);
      }
    });
  }
};

SkinDb.prototype.close = function() {
  if (this.state === STATE_CLOSE) {
    return;
  }else if (this.state === STATE_OPEN) {
    this.state = STATE_CLOSE;
    this.db.close();
  }else if (this.state === STATE_OPENNING) {
    var that = this;
    this.emitter.once('open', function(err, db) {
        that.state = STATE_CLOSE;
        db.close();
      });
  }
};

SkinDb.prototype.collection = function(name) {
  var collection = this._collections[name];
  if (!collection) {
    this._collections[name] = collection = new SkinCollection(this, name);
  }
  return collection;
};

/*
   1. collection
   2. collection, extends1, extends2,... extendsn
   3. collection, SkinCollection
*/
SkinDb.prototype.bind = function() {
  var args = Array.prototype.slice.call(arguments),
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

//bind method of mongo.Db to SkinDb
for (var name in Db.prototype) {
  var method = Db.prototype[name];
  if (name !== 'bind' && name !== 'open' && name !== 'collection' && name !== 'admin') {
    bindSkin(name, method);
  }
}

