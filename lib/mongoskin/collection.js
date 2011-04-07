/**
  bind these methods from Collection.prototype to Provider

  methods:
    insert
    checkCollectionName
    remove
    rename
    insertAll
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
var __slice = Array.prototype.slice,
    events = require('events'),
    Collection = require('mongodb').Collection,
    SkinCursor = require('./cursor').SkinCursor,
    STATE_CLOSE = 0,
    STATE_OPENNING = 1,
    STATE_OPEN = 2;

var SkinCollection = exports.SkinCollection = function(skinDb, collectionName) {
  this.skinDb = skinDb;
  this.collectionName = collectionName;
  this.collection;
  this.state = STATE_CLOSE;
  this.internalHint;
  var that = this;
  this.__defineGetter__('hint', function() { return this.internalHint; });
  this.__defineSetter__('hint', function(value) {
      this.internalHint = value;
      this.open(function(err, collection) {
        collection.hint = value;
        that.internalHint = collection.hint;
      });
  });

  this.emitter = new events.EventEmitter();
}

var bindSkin = function(name, method) {
  SkinCollection.prototype[name] = function() {
    var args = arguments.length > 0 ? __slice.call(arguments, 0) : [];
    return this.open(function(err, collection) {
      if (err) {
        args[args.length - 1](err);
      } else {
        method.apply(collection, args);
      }
    });
  };
};

for (var name in Collection.prototype) {
  var method = Collection.prototype[name];
  bindSkin(name, method);
}

SkinCollection.prototype._find = SkinCollection.prototype.find;

SkinCollection.prototype.open = function(fn) {
  switch (this.state) {
    case STATE_OPEN:
      return fn(null, this.collection);
    case STATE_OPENNING:
      return this.emitter.addListener('open', fn);
    case STATE_CLOSE:
    default:
      var that = this;
      this.emitter.addListener('open', fn);
      this.state = STATE_OPENNING;
      this.skinDb.open(function(err, db) {
          if (err) {
            that.state = STATE_CLOSE;
            return that.emitter.emit('open', err, null);
          }
          that.skinDb.db.collection(that.collectionName, function(err, collection) {
              if (collection) {
                that.state = STATE_OPEN;
                that.collection = collection;
                if (that.hint) {
                  that.collection.hint = that.hit;
                }
              }else {
                that.state = STATE_CLOSE;
              }
              that.emitter.emit('open', err, collection);
          });
      });
  }
};

SkinCollection.prototype.close = function(){
  this.state = STATE_CLOSE;
}

SkinCollection.prototype.drop = function(fn) {
  this.skinDb.dropCollection(this.collectionName, fn);
  this.close();
};

SkinCollection.prototype.findItems = function() {
  var args = __slice.call(arguments),
    fn = args[args.length - 1];

  args[args.length - 1] = function(err, cursor) {
    if (err) {
      fn(err);
    } else {
      cursor.toArray(fn);
    }
  }

  this._find.apply(this, args);
};

SkinCollection.prototype.findEach = function() {
  var args = __slice.call(arguments),
      fn = args[args.length - 1];

  args[args.length - 1] = function(err, cursor) {
    if (err) {
      fn(err);
    } else {
      cursor.each(fn);
    }
  }

  this._find.apply(this, args);
};

SkinCollection.prototype.id = function(hex) {
  return this.skinDb.db.bson_serializer.ObjectID.createFromHexString(hex);
};

SkinCollection.prototype.findById = function() {
  var args = __slice.call(arguments);
  args[0] = {_id: this.id(args[0])};
  this.findOne.apply(this, args);
};

SkinCollection.prototype.updateById = function() {
  var args = __slice.call(arguments);
  args[0] = {_id: this.id(args[0])};
  this.update.apply(this, args);
};

SkinCollection.prototype.find = function() {
  var args = arguments.length > 0 ? __slice.call(arguments, 0) : [];
  if (args.length > 0 && typeof(args[args.length - 1]) === 'function') {
    this._find.apply(this, args);
  }else {
    return new SkinCursor(null, this, args);
  }
};

