# TOC
   - [helper.id()](#helperid)
   - [connect_db](#connect_db)
     - [db.js](#connect_db-dbjs)
     - [collection.js](#connect_db-collectionjs)
       - [find(), findItems(), findEach()](#connect_db-collectionjs-find-finditems-findeach)
         - [mock find() error](#connect_db-collectionjs-find-finditems-findeach-mock-find-error)
       - [findById(), updateById(), removeById()](#connect_db-collectionjs-findbyid-updatebyid-removebyid)
         - [findById()](#connect_db-collectionjs-findbyid-updatebyid-removebyid-findbyid)
         - [updateById()](#connect_db-collectionjs-findbyid-updatebyid-removebyid-updatebyid)
         - [removeById()](#connect_db-collectionjs-findbyid-updatebyid-removebyid-removebyid)
     - [cursor.js](#connect_db-cursorjs)
     - [db.admin()](#connect_db-dbadmin)
     - [new Admin(db)](#connect_db-new-admindb)
     - [db.grid()](#connect_db-dbgrid)
     - [new Grid(db, fsName)](#connect_db-new-griddb-fsname)
     - [grid_store.js](#connect_db-grid_storejs)
   - [new_db](#new_db)
     - [db.js](#new_db-dbjs)
     - [collection.js](#new_db-collectionjs)
       - [find(), findItems(), findEach()](#new_db-collectionjs-find-finditems-findeach)
         - [mock find() error](#new_db-collectionjs-find-finditems-findeach-mock-find-error)
       - [findById(), updateById(), removeById()](#new_db-collectionjs-findbyid-updatebyid-removebyid)
         - [findById()](#new_db-collectionjs-findbyid-updatebyid-removebyid-findbyid)
         - [updateById()](#new_db-collectionjs-findbyid-updatebyid-removebyid-updatebyid)
         - [removeById()](#new_db-collectionjs-findbyid-updatebyid-removebyid-removebyid)
     - [cursor.js](#new_db-cursorjs)
     - [db.admin()](#new_db-dbadmin)
     - [new Admin(db)](#new_db-new-admindb)
     - [db.grid()](#new_db-dbgrid)
     - [new Grid(db, fsName)](#new_db-new-griddb-fsname)
     - [grid_store.js](#new_db-grid_storejs)
   - [makeSkinClass](#makeskinclass)
     - [SkinClass](#makeskinclass-skinclass)
<a name=""></a>
 
<a name="helperid"></a>
# helper.id()
should convert string id to ObjectID success.

```js
var id = '4ec4b2b9f44a927223000001';
id = helper.toObjectID(id);
id.should.be.instanceof(ObjectID);
id = helper.toObjectID(id);
id.should.be.instanceof(ObjectID);
id = '4ec4b2b9f44a927223000foo';
id = helper.toObjectID(id);
id.should.be.instanceof(ObjectID);
```

should return source id when id length !== 24.

```js
var ids = [123, '4ec4b2b9f44a92722300000', 'abc', '4ec4b2b9f44a927223000f00123123'];
ids.forEach(function (id) {
    helper.toObjectID(id).should.equal(id);
});
```

<a name="connect_db"></a>
# connect_db
<a name="connect_db-dbjs"></a>
## db.js
skinDb.collection() should retrive native collection with callback.

```js
var skinColl = db.collection('testRetriveCollection', function(err, coll) {
    should.not.exist(err);
    skinColl._native.should.eql(coll);
    done();
});
should.exist(skinColl);
```

<a name="connect_db-collectionjs"></a>
## collection.js
should retrive native cursor.

```js
db.collection('test_collection').find(function(err, cursor) {
    should.not.exists(err);
    cursor.toArray.should.be.instanceof(Function);
    should.not.exists(cursor.open);
    done();
});
```

<a name="connect_db-collectionjs-find-finditems-findeach"></a>
### find(), findItems(), findEach()
should find().toArray() return 100 comments.

```js
commentcollection.find().toArray(function (err, rows) {
  should.not.exist(err);
  rows.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems(fn) all comments.

```js
commentcollection.findItems(function (err, comments) {
  should.not.exist(err);
  should.exist(comments);
  comments.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems({} fn) all comments.

```js
commentcollection.findItems(function (err, comments) {
  should.not.exist(err);
  should.exist(comments);
  comments.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems({limit: 10}) query wrong return top 0 comments.

```js
commentcollection.findItems({limit: 10}, function (err, comments) {
  should.not.exist(err);
  comments.should.be.instanceof(Array).with.length(0);
  done();
});
```

should findItems({}, {limit: 10}) return top 10 comments.

```js
commentcollection.findItems({}, {limit: 10}, function (err, comments) {
  should.not.exist(err);
  comments.should.be.instanceof(Array).with.length(10);
  done();
});
```

should findEach(fn) call fn 100 times.

```js
var count = 0;
commentcollection.findEach(function (err, comment) {
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
commentcollection.findEach({}, {limit: 20}, function (err, comment) {
  should.not.exist(err);
  if (!comment) {
    count.should.equal(20);
    return done();
  }
  count++;
});
```

<a name="connect_db-collectionjs-find-finditems-findeach-mock-find-error"></a>
#### mock find() error
should findItems() error.

```js
commentcollection.findItems(function (err, docs) {
  should.exist(err);
  err.should.be.instanceof(Error).with.have.property('message', 'mock find() error');
  should.not.exist(docs);
  done();
});
```

should findEach() error.

```js
commentcollection.findEach(function (err, docs) {
  should.exist(err);
  err.should.be.instanceof(Error).with.have.property('message', 'mock find() error');
  should.not.exist(docs);
  done();
});
```

<a name="connect_db-collectionjs-findbyid-updatebyid-removebyid"></a>
### findById(), updateById(), removeById()
<a name="connect_db-collectionjs-findbyid-updatebyid-removebyid-findbyid"></a>
#### findById()
should find one object by ObjectID.

```js
db.article.findById(articleId, function (err, article) {
  should.not.exist(err);
  should.exist(article);
  article.should.have.property('_id').with.instanceof(ObjectID);
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
  article.should.have.property('_id').with.instanceof(ObjectID);
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

<a name="connect_db-collectionjs-findbyid-updatebyid-removebyid-updatebyid"></a>
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

<a name="connect_db-collectionjs-findbyid-updatebyid-removebyid-removebyid"></a>
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

<a name="connect_db-cursorjs"></a>
## cursor.js
should call toArray().

```js
db.collection('testCursor').find().toArray(function(err, items) {
    should.not.exist(err);
    items.should.be.instanceof(Array).with.length(100);
    done();
});
```

should cursor.skip(10).limit(10).toArray() return 10 rows.

```js
db.collection('testCursor').find().skip(10).limit(10).toArray(function (err, rows) {
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
db.collection('testCursor').find().sort({index: -1}).skip(20).limit(10).toArray(function (err, rows) {
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
db.collection('testCursor').find().count(function (err, count) {
  should.not.exist(err);
  count.should.equal(100);
  done();
});
```

should cursor.explain() return 100.

```js
db.collection('testCursor').find({index: {$gt: 50}}).explain(function (err, result) {
  should.not.exist(err);
  result.should.have.property('cursor', 'BasicCursor');
  result.should.have.property('nscanned', 100);
  result.should.have.property('nscannedObjects', 100);
  result.should.have.property('n', 49);
  done();
});
```

<a name="connect_db-dbadmin"></a>
## db.admin()
should add the new user to the admin database.

```js
adminDb.addUser('admin3', 'admin3', done);
```

should authenticate using the newly added user.

```js
adminDb.authenticate('admin3', 'admin3', done);
```

should retrive the build information for the mongodb instance.

```js
adminDb.buildInfo(done);
```

should remove user just added.

```js
adminDb.removeUser('admin3', done);
```

<a name="connect_db-new-admindb"></a>
## new Admin(db)
should add the new user to the admin database.

```js
adminDb.addUser('admin3', 'admin3', done);
```

should authenticate using the newly added user.

```js
adminDb.authenticate('admin3', 'admin3', done);
```

should retrive the build information for the mongodb instance.

```js
adminDb.buildInfo(done);
```

should remove user just added.

```js
adminDb.removeUser('admin3', done);
```

<a name="connect_db-dbgrid"></a>
## db.grid()
should write data to grid.

```js
grid.put(originalData, {}, function(err, result) {
    should.not.exist(err);
    result._id.should.not.eql(id);
    done();
});
```

should get data just put to grid.

```js
grid.get(id, function(err, data) {
    assert.deepEqual(originalData.toString('base64'), data.toString('base64'));
    done(err);
});
```

<a name="connect_db-new-griddb-fsname"></a>
## new Grid(db, fsName)
should write data to grid.

```js
grid.put(originalData, {}, function(err, result) {
    should.not.exist(err);
    result._id.should.not.eql(id);
    done();
});
```

should get data just put to grid.

```js
grid.get(id, function(err, data) {
    assert.deepEqual(originalData.toString('base64'), data.toString('base64'));
    done(err);
});
```

<a name="connect_db-grid_storejs"></a>
## grid_store.js
should write data to file.

```js
// Write a text string
gridStore.write(originData, function(err) {
    gridStore.close(done);
});
```

should read file.

```js
// use mongoskin style to create gridStore
db.gridStore(fileId, 'r').read(function(err, data) {
    should.not.exist(err);
    data.toString().should.equal(originData);
    done();
})
```

should execute GridStore static methods.

```js
GridStore.exist(db, fileId, done)
```

<a name="new_db"></a>
# new_db
<a name="new_db-dbjs"></a>
## db.js
skinDb.collection() should retrive native collection with callback.

```js
var skinColl = db.collection('testRetriveCollection', function(err, coll) {
    should.not.exist(err);
    skinColl._native.should.eql(coll);
    done();
});
should.exist(skinColl);
```

<a name="new_db-collectionjs"></a>
## collection.js
should retrive native cursor.

```js
db.collection('test_collection').find(function(err, cursor) {
    should.not.exists(err);
    cursor.toArray.should.be.instanceof(Function);
    should.not.exists(cursor.open);
    done();
});
```

<a name="new_db-collectionjs-find-finditems-findeach"></a>
### find(), findItems(), findEach()
should find().toArray() return 100 comments.

```js
commentcollection.find().toArray(function (err, rows) {
  should.not.exist(err);
  rows.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems(fn) all comments.

```js
commentcollection.findItems(function (err, comments) {
  should.not.exist(err);
  should.exist(comments);
  comments.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems({} fn) all comments.

```js
commentcollection.findItems(function (err, comments) {
  should.not.exist(err);
  should.exist(comments);
  comments.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems({limit: 10}) query wrong return top 0 comments.

```js
commentcollection.findItems({limit: 10}, function (err, comments) {
  should.not.exist(err);
  comments.should.be.instanceof(Array).with.length(0);
  done();
});
```

should findItems({}, {limit: 10}) return top 10 comments.

```js
commentcollection.findItems({}, {limit: 10}, function (err, comments) {
  should.not.exist(err);
  comments.should.be.instanceof(Array).with.length(10);
  done();
});
```

should findEach(fn) call fn 100 times.

```js
var count = 0;
commentcollection.findEach(function (err, comment) {
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
commentcollection.findEach({}, {limit: 20}, function (err, comment) {
  should.not.exist(err);
  if (!comment) {
    count.should.equal(20);
    return done();
  }
  count++;
});
```

<a name="new_db-collectionjs-find-finditems-findeach-mock-find-error"></a>
#### mock find() error
should findItems() error.

```js
commentcollection.findItems(function (err, docs) {
  should.exist(err);
  err.should.be.instanceof(Error).with.have.property('message', 'mock find() error');
  should.not.exist(docs);
  done();
});
```

should findEach() error.

```js
commentcollection.findEach(function (err, docs) {
  should.exist(err);
  err.should.be.instanceof(Error).with.have.property('message', 'mock find() error');
  should.not.exist(docs);
  done();
});
```

<a name="new_db-collectionjs-findbyid-updatebyid-removebyid"></a>
### findById(), updateById(), removeById()
<a name="new_db-collectionjs-findbyid-updatebyid-removebyid-findbyid"></a>
#### findById()
should find one object by ObjectID.

```js
db.article.findById(articleId, function (err, article) {
  should.not.exist(err);
  should.exist(article);
  article.should.have.property('_id').with.instanceof(ObjectID);
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
  article.should.have.property('_id').with.instanceof(ObjectID);
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

<a name="new_db-collectionjs-findbyid-updatebyid-removebyid-updatebyid"></a>
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

<a name="new_db-collectionjs-findbyid-updatebyid-removebyid-removebyid"></a>
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

<a name="new_db-cursorjs"></a>
## cursor.js
should call toArray().

```js
db.collection('testCursor').find().toArray(function(err, items) {
    should.not.exist(err);
    items.should.be.instanceof(Array).with.length(100);
    done();
});
```

should cursor.skip(10).limit(10).toArray() return 10 rows.

```js
db.collection('testCursor').find().skip(10).limit(10).toArray(function (err, rows) {
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
db.collection('testCursor').find().sort({index: -1}).skip(20).limit(10).toArray(function (err, rows) {
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
db.collection('testCursor').find().count(function (err, count) {
  should.not.exist(err);
  count.should.equal(100);
  done();
});
```

should cursor.explain() return 100.

```js
db.collection('testCursor').find({index: {$gt: 50}}).explain(function (err, result) {
  should.not.exist(err);
  result.should.have.property('cursor', 'BasicCursor');
  result.should.have.property('nscanned', 100);
  result.should.have.property('nscannedObjects', 100);
  result.should.have.property('n', 49);
  done();
});
```

<a name="new_db-dbadmin"></a>
## db.admin()
should add the new user to the admin database.

```js
adminDb.addUser('admin3', 'admin3', done);
```

should authenticate using the newly added user.

```js
adminDb.authenticate('admin3', 'admin3', done);
```

should retrive the build information for the mongodb instance.

```js
adminDb.buildInfo(done);
```

should remove user just added.

```js
adminDb.removeUser('admin3', done);
```

<a name="new_db-new-admindb"></a>
## new Admin(db)
should add the new user to the admin database.

```js
adminDb.addUser('admin3', 'admin3', done);
```

should authenticate using the newly added user.

```js
adminDb.authenticate('admin3', 'admin3', done);
```

should retrive the build information for the mongodb instance.

```js
adminDb.buildInfo(done);
```

should remove user just added.

```js
adminDb.removeUser('admin3', done);
```

<a name="new_db-dbgrid"></a>
## db.grid()
should write data to grid.

```js
grid.put(originalData, {}, function(err, result) {
    should.not.exist(err);
    result._id.should.not.eql(id);
    done();
});
```

should get data just put to grid.

```js
grid.get(id, function(err, data) {
    assert.deepEqual(originalData.toString('base64'), data.toString('base64'));
    done(err);
});
```

<a name="new_db-new-griddb-fsname"></a>
## new Grid(db, fsName)
should write data to grid.

```js
grid.put(originalData, {}, function(err, result) {
    should.not.exist(err);
    result._id.should.not.eql(id);
    done();
});
```

should get data just put to grid.

```js
grid.get(id, function(err, data) {
    assert.deepEqual(originalData.toString('base64'), data.toString('base64'));
    done(err);
});
```

<a name="new_db-grid_storejs"></a>
## grid_store.js
should write data to file.

```js
// Write a text string
gridStore.write(originData, function(err) {
    gridStore.close(done);
});
```

should read file.

```js
// use mongoskin style to create gridStore
db.gridStore(fileId, 'r').read(function(err, data) {
    should.not.exist(err);
    data.toString().should.equal(originData);
    done();
})
```

should execute GridStore static methods.

```js
GridStore.exist(db, fileId, done)
```

<a name="makeskinclass"></a>
# makeSkinClass
<a name="makeskinclass-skinclass"></a>
## SkinClass
should call native method.

```js
skinFoo.get('echo', function(err, echo) {
    should.not.exists(err);
    echo.should.eql('echo');
    done();
});
```

should callback error if error occused.

```js
skinFoo.makeError('123', function(err) {
    err.code.should.eql('123');
    done();
})
```

should chain operations.

```js
skinFoo.chain().chain().chain().get('echo', done);
```

should log open error if no callback.

```js
var errFoo = new SkinFoo();
errFoo.willOpenError = true;
errFoo.chain();
setTimeout(done, 15);
```

should callback open error in chain callback.

```js
var errFoo = new SkinFoo();
errFoo.willOpenError = true;
errFoo.chain().chain().chain().get(function(err) {
    err.code.should.eql('ERROPEN');
    done();
});
```

should get native property after open.

```js
skinFoo.isOpen.should.be.true;
done();
```

should set native property before open.

```js
var foo = new SkinFoo();
foo.isOpen = 'abc';
foo.open(function(err, p_foo) {
    should.not.exists(err);
    p_foo.isOpen.should.eql('abc');
    done();
})
```

should close just while openning.

```js
var foo = new SkinFoo();
foo.chain().close(done);
```

should call close even closing or closed.

```js
var foo = new SkinFoo();
foo.chain().close().close(done);
```

