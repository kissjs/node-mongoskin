Already up-to-date.
# TOC
   - [admin.js](#adminjs)
     - [open()](#adminjs-open)
   - [collection.js](#collectionjs)
     - [normal](#collectionjs-normal)
       - [open()](#collectionjs-normal-open)
       - [id()](#collectionjs-normal-id)
       - [find(), findItems(), findEach()](#collectionjs-normal-find-finditems-findeach)
         - [mock find() error](#collectionjs-normal-find-finditems-findeach-mock-find-error)
       - [findById(), updateById(), removeById()](#collectionjs-normal-findbyid-updatebyid-removebyid)
         - [findById()](#collectionjs-normal-findbyid-updatebyid-removebyid-findbyid)
         - [updateById()](#collectionjs-normal-findbyid-updatebyid-removebyid-updatebyid)
         - [removeById()](#collectionjs-normal-findbyid-updatebyid-removebyid-removebyid)
   - [cursor.js](#cursorjs)
     - [normal](#cursorjs-normal)
       - [new SkinCursor()](#cursorjs-normal-new-skincursor)
       - [open()](#cursorjs-normal-open)
       - [sort(), limit(), skip(), toArray(), count(), explain()](#cursorjs-normal-sort-limit-skip-toarray-count-explain)
   - [db.js](#dbjs)
     - [normal](#dbjs-normal)
       - [bind()](#dbjs-normal-bind)
       - [gridfs()](#dbjs-normal-gridfs)
       - [open()](#dbjs-normal-open)
       - [close()](#dbjs-normal-close)
       - [ensureIndex()](#dbjs-normal-ensureindex)
   - [gridfs.js](#gridfsjs)
   - [router.js](#routerjs)
   - [server.js](#serverjs)
   - [utils.js](#utilsjs)
<a name=""></a>
 
<a name="adminjs"></a>
# admin.js
<a name="adminjs-open"></a>
## open()
should return admin.

```js
var skinAdmin = new SkinAdmin(skinDb);
skinAdmin.state.should.equal(constant.STATE_CLOSE);
skinAdmin.open(function (err, admin) {
  should.not.exist(err);
  should.exist(admin);
  should.exist(skinAdmin.admin);
  skinAdmin.state.should.equal(constant.STATE_OPEN);
}).open(function (err, admin) {
  skinAdmin.open(function (err, admin) {
    should.not.exist(err);
    should.exist(admin);
    should.exist(skinAdmin.admin);
    skinAdmin.state.should.equal(constant.STATE_OPEN);
    done();
  });
});
skinAdmin.state.should.equal(constant.STATE_OPENNING);
```

should return mock open() error.

```js
skinDb.open = function (callback) {
  process.nextTick(function () {
    callback(new Error('mock open() error'));
  });
};
var skinAdmin = new SkinAdmin(skinDb);
skinAdmin.open(function (err, admin) {
  should.exist(err);
  err.should.have.property('message', 'mock open() error');
  should.not.exist(admin);
  should.not.exist(skinAdmin.admin);
  done();
});
```

<a name="collectionjs"></a>
# collection.js
<a name="collectionjs-normal"></a>
## normal
<a name="collectionjs-normal-open"></a>
### open()
should return a collection.

```js
var collection = new SkinCollection(skinDb, 'foo');
collection.hint = 123;
collection.open(function (err, coll) {
  should.not.exist(err);
  coll.should.have.property('name', 'mock collection');
  collection.state.should.equal(constant.STATE_OPEN);
  done();
});
```

should return mock skinDb.open() error.

```js
skinDb.open = function (callback) {
  process.nextTick(function () {
    callback(new Error('mock skinDb.open() error'));
  });
};
var collection = new SkinCollection(skinDb, 'foo');
collection.open(function (err, coll) {
  should.exist(err);
  err.should.have.property('message', 'mock skinDb.open() error');
  should.not.exist(coll);
  collection.state.should.equal(constant.STATE_CLOSE);
  done();
});
```

should return mock db.collection() error.

```js
skinDb.db.collection = function (name, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  process.nextTick(function () {
    callback(new Error('mock db.collection() error'));
  });
};
var collection = new SkinCollection(skinDb, 'foo');
collection.open(function (err, coll) {
  should.exist(err);
  should.not.exist(coll);
  err.should.have.property('message', 'mock db.collection() error');
  collection.state.should.equal(constant.STATE_CLOSE);
  done();
});
```

<a name="collectionjs-normal-id"></a>
### id()
should convert string id to ObjectID success.

```js
var id = '4ec4b2b9f44a927223000001';
id = db.testcollection.id(id);
id.should.be.instanceof(db.testcollection.ObjectID);
id = db.testcollection.id(id);
id.should.be.instanceof(db.testcollection.ObjectID);
id = '4ec4b2b9f44a927223000foo';
id = db.testcollection.id(id);
id.should.be.instanceof(db.testcollection.ObjectID);
```

should return source id when id length !== 24.

```js
var ids = [123, '4ec4b2b9f44a92722300000', 'abc', '4ec4b2b9f44a927223000f00123123'];
ids.forEach(function (id) {
  db.testcollection.id(id).should.equal(id);
});
```

<a name="collectionjs-normal-find-finditems-findeach"></a>
### find(), findItems(), findEach()
should find().toArray() return 100 comments.

```js
db.comment.find().toArray(function (err, rows) {
  should.not.exist(err);
  rows.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems(fn) all comments.

```js
db.comment.findItems(function (err, comments) {
  should.not.exist(err);
  should.exist(comments);
  comments.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems({} fn) all comments.

```js
db.comment.findItems(function (err, comments) {
  should.not.exist(err);
  should.exist(comments);
  comments.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems({limit: 10}) query wrong return top 0 comments.

```js
db.comment.findItems({limit: 10}, function (err, comments) {
  should.not.exist(err);
  comments.should.be.instanceof(Array).with.length(0);
  done();
});
```

should findItems({}, {limit: 10}) return top 10 comments.

```js
db.comment.findItems({}, {limit: 10}, function (err, comments) {
  should.not.exist(err);
  comments.should.be.instanceof(Array).with.length(10);
  done();
});
```

should findEach(fn) call fn 100 times.

```js
var count = 0;
db.comment.findEach(function (err, comment) {
  should.not.exist(err);
  if (!comment) {
    count.should.equal(100);
    return done();
  }
  count++;
});
```

should findEach({}, {limit: 20}, fn) call fn 20 times.

```js
var count = 0;
db.comment.findEach({}, {limit: 20}, function (err, comment) {
  should.not.exist(err);
  if (!comment) {
    count.should.equal(20);
    return done();
  }
  count++;
});
```

<a name="collectionjs-normal-find-finditems-findeach-mock-find-error"></a>
#### mock find() error
should findItems() error.

```js
db.comment.findItems(function (err, docs) {
  should.exist(err);
  err.should.be.instanceof(Error).with.have.property('message', 'mock find() error');
  should.not.exist(docs);
  done();
});
```

should findEach() error.

```js
db.comment.findEach(function (err, docs) {
  should.exist(err);
  err.should.be.instanceof(Error).with.have.property('message', 'mock find() error');
  should.not.exist(docs);
  done();
});
```

<a name="collectionjs-normal-findbyid-updatebyid-removebyid"></a>
### findById(), updateById(), removeById()
<a name="collectionjs-normal-findbyid-updatebyid-removebyid-findbyid"></a>
#### findById()
should find one object by ObjectID.

```js
db.article.findById(articleId, function (err, article) {
  should.not.exist(err);
  should.exist(article);
  article.should.have.property('_id').with.instanceof(db.ObjectID);
  article.should.have.property('created_at').with.instanceof(Date);
  article.should.have.property('title').with.include(now.toString());
  article.created_at.toString().should.equal(now.toString());
  done();
});
```

should find one object by String id.

```js
db.article.findById(articleId.toString(), function (err, article) {
  should.not.exist(err);
  should.exist(article);
  article.should.have.property('_id').with.instanceof(db.ObjectID);
  article.should.have.property('created_at').with.instanceof(Date);
  article.should.have.property('title').with.include(now.toString());
  article.created_at.toString().should.equal(now.toString());
  done();
});
```

should not find when id not exists.

```js
db.article.findById('foo', function (err, article) {
  should.not.exist(err);
  should.not.exist(article);
  done();
});
```

<a name="collectionjs-normal-findbyid-updatebyid-removebyid-updatebyid"></a>
#### updateById()
should update obj by id.

```js
var updatedTime = new Date();
var doc = {
  $set: {
    title: 'new title ' + updatedTime,
    updated_at: updatedTime
  }
};
db.article.updateById(articleId.toString(), doc, function (err, success, result) {
  should.not.exist(err);
  success.should.equal(1);
  result.should.have.property('ok', 1);
  db.article.findById(articleId, function (err, article) {
    should.not.exist(err);
    should.exist(article);
    article.should.have.property('title', 'new title ' + updatedTime);
    article.should.have.property('updated_at').with.instanceof(Date);
    article.updated_at.toString().should.equal(updatedTime.toString());
    done();
  });
});
```

<a name="collectionjs-normal-findbyid-updatebyid-removebyid-removebyid"></a>
#### removeById()
should remove obj by id.

```js
var id = articleId.toString();
db.article.findById(id, function (err, article) {
  should.not.exist(err);
  should.exist(article);
  db.article.removeById(id, function (err, success) {
    should.not.exist(err);
    success.should.equal(1);
    db.article.findById(id, function (err, article) {
      should.not.exist(err);
      should.not.exist(article);
      done();
    });
  });
});
```

should remove not exists obj.

```js
var id = articleId.toString();
db.article.removeById(id, function (err, success) {
  should.not.exist(err);
  success.should.equal(0);
  done();
});
```

<a name="cursorjs"></a>
# cursor.js
<a name="cursorjs-normal"></a>
## normal
<a name="cursorjs-normal-new-skincursor"></a>
### new SkinCursor()
should state is open when cursor exists.

```js
var cursor = new SkinCursor({}, {});
cursor.should.have.property('state', constant.STATE_OPEN);
```

should state is close when cursor not exists.

```js
var cursor = new SkinCursor(null, {});
cursor.should.have.property('state', constant.STATE_CLOSE);
```

<a name="cursorjs-normal-open"></a>
### open()
should success when state is close.

```js
var cursor = new SkinCursor(null, collection);
cursor.open(function (err, mockCursor) {
  should.not.exist(err);
  mockCursor.should.have.property('name', 'mock cursor');
  done();
});
```

should success when state is openning.

```js
var cursor = new SkinCursor(null, collection);
cursor.open(function (err, mockCursor) {
  should.not.exist(err);
  mockCursor.should.have.property('name', 'mock cursor');
});
cursor.open(function (err, mockCursor) {
  should.not.exist(err);
  mockCursor.should.have.property('name', 'mock cursor');
  done();
});
```

should success when state is open.

```js
var cursor = new SkinCursor({name: 'mock cursor 2'}, collection);
cursor.open(function (err, mockCursor) {
  should.not.exist(err);
  mockCursor.should.have.property('name', 'mock cursor 2');
  done();
});
```

should return mock error.

```js
collection.open = function (callback) {
  process.nextTick(function () {
    callback(new Error('mock collection.open() error'));
  });
};
var cursor = new SkinCursor(null, collection);
cursor.open(function (err, mockCursor) {
  should.exist(err);
  err.should.have.property('message', 'mock collection.open() error');
  should.not.exist(mockCursor);
  done();
});
```

<a name="cursorjs-normal-sort-limit-skip-toarray-count-explain"></a>
### sort(), limit(), skip(), toArray(), count(), explain()
should cursor.skip(10).limit(10).toArray() return 10 rows.

```js
db.testCursor.find().skip(10).limit(10).toArray(function (err, rows) {
  should.not.exist(err);
  should.exist(rows);
  rows.should.be.instanceof(Array).with.length(10);
  rows[0].name.should.equal('name 10');
  rows[9].name.should.equal('name 19');
  done();
});
```

should cursor.sort({index: -1}).skip(20).limit(10).toArray() return 10 rows.

```js
db.testCursor.find().sort({index: -1}).skip(20).limit(10).toArray(function (err, rows) {
  should.not.exist(err);
  should.exist(rows);
  rows.should.be.instanceof(Array).with.length(10);
  rows[0].name.should.equal('name 79');
  rows[9].name.should.equal('name 70');
  done();
});
```

should cursor.count() return 100.

```js
db.testCursor.find().count(function (err, count) {
  should.not.exist(err);
  count.should.equal(100);
  done();
});
```

should cursor.explain() return 100.

```js
db.testCursor.find({index: {$gt: 50}}).explain(function (err, result) {
  should.not.exist(err);
  result.should.have.property('cursor', 'BasicCursor');
  result.should.have.property('nscanned', 100);
  result.should.have.property('nscannedObjects', 100);
  result.should.have.property('n', 49);
  done();
});
```

<a name="dbjs"></a>
# db.js
<a name="dbjs-normal"></a>
## normal
<a name="dbjs-normal-bind"></a>
### bind()
should throw error when collection name wrong.

```js
var wrongNames = ['', null, 123, '    ', '\n   \t   ', undefined, 0, 1, new Date(), {}, []];
wrongNames.forEach(function (name) {
  (function () {
    db.bind(name);
  }).should.throw('Must provide collection name to bind.');
});
```

should throw error when options is not object.

```js
(function () {
  db.bind('foo', function () {});
}).should.throw('the args[1] should be object, but is `function () {}`');
```

should add helper methods to collection.

```js
db.bind('testCollection', {
  totalCount: function (calllback) {
    this.count(calllback);
  }
});
db.should.have.property('testCollection').with.have.property('totalCount').with.be.a('function');
db.testCollection.totalCount(function (err, total) {
  should.not.exist(err);
  total.should.equal(0);
  done();
});
```

should add options and helper methods to collection.

```js
db.bind('testExistsCollection', {strict: true}, {
  totalCount: function (calllback) {
    this.count(calllback);
  }
});
db.should.have.property('testExistsCollection').with.have.property('totalCount').with.be.a('function');
db.testExistsCollection.insert({name: 'item2'}, function (err, row) {
  should.not.exist(err);
  should.exist(row);
  db.testExistsCollection.findItems(function (err, rows) {
    should.not.exist(err);
    rows.should.length(2);
    rows[0].name.should.equal('item1');
    rows[1].name.should.equal('item2');
    db.testExistsCollection.totalCount(function (err, total) {
      should.not.exist(err);
      total.should.equal(2);
      done();
    });
  });
});
```

should throw error when bind collection not exists in safe mode.

```js
db.bind('notExistsCollection', {strict: true});
db.notExistsCollection.count(function (err, count) {
  should.exist(err);
  err.should.have.property('message', 'Collection notExistsCollection does not exist. Currently in safe mode.');
  should.not.exist(count);
  done();
});
```

<a name="dbjs-normal-gridfs"></a>
### gridfs()
should start gridfs store.

```js
db.gridfs();
db.should.have.property('skinGridStore');
```

<a name="dbjs-normal-open"></a>
### open()
should open a database connection.

```js
var db1 = mongoskin.db(servers, options);
db1.state.should.equal(0);
db1.open(function (err) {
  should.not.exist(err);
  db1.state.should.equal(2);
}).open(function (err) {
  should.not.exist(err);
  db1.state.should.equal(2);
  done();
});
db1.state.should.equal(1);
```

should open a database connection with user auth fail.

```js
var db2 = mongoskin.db(authfailServers, authfailOptions);
done = pedding(2, done);
db2.state.should.equal(constant.STATE_CLOSE);
db2.open(function (err, db) {
  should.exist(err);
  err.should.have.property('message', 'auth fails');
  err.should.have.property('name', 'MongoError');
  should.not.exist(db);
  db2.state.should.equal(constant.STATE_CLOSE);
  // open again
  db2.open(function (err, db) {
    should.exist(err);
    err.should.have.property('message', 'auth fails');
    err.should.have.property('name', 'MongoError');
    should.not.exist(db);
    db2.state.should.equal(constant.STATE_CLOSE);
    db2.open(function (err, db) {
      should.exist(err);
      err.should.have.property('message', 'auth fails');
      err.should.have.property('name', 'MongoError');
      should.not.exist(db);
      db2.state.should.equal(constant.STATE_CLOSE);
      done();
    });
  });
});
db2.state.should.equal(constant.STATE_OPENNING);
db2.open(function (err, db) {
  should.exist(err);
  err.should.have.property('message', 'auth fails');
  err.should.have.property('name', 'MongoError');
  should.not.exist(db);
  done();
});
```

should open 100 times ok.

```js
var db3 = mongoskin.db(servers, options);
done = pedding(100, done);
for (var i = 0; i < 100; i++) {
  db3.open(function (err, db) {
    should.not.exist(err);
    should.exist(db);
    done();
  });
}
```

should open timeout when connect the blackhole.

```js
var db;
if (isReplicaset) {
  db = mongoskin.db(['127.0.0.1:' + blackholePort, '127.0.0.1:' + blackholePort], 
    options, {socketOptions: {timeout: 500}});
} else {
  var ops = {};
  for (var k in options) {
    ops[k] = options[k];
  }
  ops.socketOptions = {timeout: 500};
  db = mongoskin.db('127.0.0.1:' + blackholePort, ops);
}
db.open(function (err, db) {
  should.exist(err);
  if (isReplicaset) {
    // replicaset should not timeout error
    err.should.have.property('message', 'no primary server found in set');
  } else {
    err.should.have.property('err', 'connection to [127.0.0.1:24008] timed out');
  }
  should.not.exist(db);
  done();
});
```

<a name="dbjs-normal-close"></a>
### close()
should close a database connection.

```js
var dbClose = mongoskin.db(servers, options);
dbClose.state.should.equal(0);
dbClose.close(function (err) {
  dbClose.state.should.equal(0);
  should.not.exist(err);
}).open(function (err) {
  dbClose.state.should.equal(2);
  should.not.exist(err);
}).close(function (err) {
  dbClose.state.should.equal(0);
  should.not.exist(err);
  done();
});
dbClose.state.should.equal(1);
```

should close 100 times ok.

```js
var db3 = mongoskin.db(servers, options);
done = pedding(100, done);
db.open();
for (var i = 0; i < 100; i++) {
  db3.close(function (err) {
    should.not.exist(err);
    done();
  });
}
```

<a name="dbjs-normal-ensureindex"></a>
### ensureIndex()
should index infos is empty.

```js
var barDb = mongoskin.db(servers, options);
barDb.indexInformation('not-exists', function (err, result) {
  should.not.exist(err);
  should.exist(result);
  result.should.eql({});
  done();
});
```

should get index infos error.

```js
var barDb = mongoskin.db(authfailServers, authfailOptions);
barDb.indexInformation('not-exists', function (err, result) {
  should.exist(err);
  should.not.exist(result);
  done();
});
```

should create title:1 index success.

```js
db.ensureIndex('foo', {title: 1}, function (err, result) {
  should.not.exist(err);
  should.exist(result);
  result.should.equal('title_1');
  done();
});
```

should create title:-1 index success.

```js
db.ensureIndex('foo', {title: -1}, function (err, result) {
  should.not.exist(err);
  should.exist(result);
  result.should.equal('title_-1');
  done();
});
```

should get all index infos.

```js
db.indexInformation('foo', function (err, result) {
  should.not.exist(err);
  should.exist(result);
  result.should.eql({
    _id_: [ [ '_id', 1 ] ],
    title_1: [ [ 'title', 1 ] ],
    'title_-1': [ [ 'title', -1 ] ] 
  });
  done();
});
```

process exit, stop mongod...
