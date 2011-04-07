GLOBAL.DEBUG = true;

var assert = require('assert'),
    mongo = require('../lib/mongoskin');

console.log('======== test MongoSkin.db ========');
['localhost/test', 'db://admin:admin@localhost:27017/test?auto_reconnect']
.forEach(function(server) {
  db = mongo.db(server);
  db.open(function(err, db) {
      assert.ok(db, 'fail to open ' + server);
  });
});

var bindToBlog = {
  first: function(fn) {
    this.findOne(fn);
  }
};

console.log('======== test MongoSkin.bind ========');
mongo.bind('blog', bindToBlog);
mongo.bind('users');
var db = mongo.db('localhost/test_mongoskin');
assert.equal(db.blog.first, bindToBlog.first);
assert.ok(db.users);

console.log('======== test SkinDb bson ========');
assert.ok(db.db.bson_serializer.ObjectID.createFromHexString('a7b79d4dca9d730000000000'));

console.log('======== test SkinDb.bind ========');
db.bind('blog2', bindToBlog);
db.bind('user2');
assert.equal(db.blog2.first, bindToBlog.first);
assert.ok(db.user2);

console.log('======== test SkinDb.open ========');
var db1, db2;
db.open(function(err, db) {
    assert.ok(db, err && err.stack);
    db1 = db;
    assert.equal(db1.state, 'connected');
    if (db2) {
      assert.equal(db1, db2, 'should alwayse be the same instance in db.open.');
    }
});

db.open(function(err, db) {
    assert.ok(db, err && err.stack);
    db2 = db;
    assert.equal(db2.state, 'connected');
    if (db1) {
      assert.equal(db1, db2, 'should alwayse be the same instance in db.open.');
    }
});

console.log('======== test normal method of SkinDb ========');
db.createCollection('test_createCollection', function(err, collection) {
    assert.equal(db.db.state, 'connected');
    assert.ok(collection, err && err.stack);
});


console.log('======== test SkinDb.collection ========');
assert.equal(db.blog, db.collection('blog'));

console.log('======== test SkinCollection.open ========');
var coll1, coll2;
db.blog.open(function(err, coll) {
    assert.ok(coll, err && err.stack);
    coll1 = coll;
    if (coll2) {
      assert.equal(coll1, coll2, 'should be the same instance in collection.open');
    }
});

db.blog.open(function(err, coll) {
    assert.ok(coll, err && err.stack);
    coll2 = coll;
    if (coll1) {
      assert.equal(coll1, coll2, 'should be the same instance in collection.open');
    }
});

console.log('======== test normal method of SkinCollection ========');
db.collection('test_normal').ensureIndex([['a',1]], function(err, replies){
    assert.ok(replies, err && err.stack);
});

console.log('======== test SkinCollection.find ========');
collection = db.collection('test_find');
collection.insert([{a:1},{a:2},{a:3}], function(err, replies){
    assert.ok(replies, err && err.stack);
    console.log(replies[0]._id.toString());
    collection.findById(replies[0]._id.toString(), function(err, item){
        assert.equal(item.a, 1);
    });

    collection.findItems(function(err, items){
        assert.ok(items, err && err.stack);
        console.log('found '+ items.length + ' items');
    });
    collection.findEach(function(err, item){
        assert.ok(!err, err && err.stack);
    });
    collection.find(function(err, cursor){
        assert.ok(cursor, err && err.stack);
    });

    console.log('======== test SkinCursor ========');
    collection.find().toArray(function(err, items){
        console.log('======== test find cursor toArray========');
        assert.ok(items, err && err.stack);
    });
    collection.find().each(function(err, item){
        console.log('======== test find cursor each========');
        assert.ok(!err, err && err.stack);
    });
});

/*
console.log('======== test SkinDb.close ========');
db.close();
assert.equal(db.db.state, 'notConnected');
*/

