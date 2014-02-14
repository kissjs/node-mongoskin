Already up-to-date.
# TOC
   - [helper.id()](#helperid)
   - [connect_db](#connect_db)
     - [collection.js](#connect_db-collectionjs)
       - [find(), findItems(), findEach()](#connect_db-collectionjs-find-finditems-findeach)
         - [mock find() error](#connect_db-collectionjs-find-finditems-findeach-mock-find-error)
       - [findById(), updateById(), removeById()](#connect_db-collectionjs-findbyid-updatebyid-removebyid)
         - [findById()](#connect_db-collectionjs-findbyid-updatebyid-removebyid-findbyid)
         - [updateById()](#connect_db-collectionjs-findbyid-updatebyid-removebyid-updatebyid)
         - [removeById()](#connect_db-collectionjs-findbyid-updatebyid-removebyid-removebyid)
     - [cursor.js](#connect_db-cursorjs)
       - [sort(), limit(), skip(), toArray(), count(), explain()](#connect_db-cursorjs-sort-limit-skip-toarray-count-explain)
   - [new_db](#new_db)
     - [collection.js](#new_db-collectionjs)
       - [find(), findItems(), findEach()](#new_db-collectionjs-find-finditems-findeach)
         - [mock find() error](#new_db-collectionjs-find-finditems-findeach-mock-find-error)
       - [findById(), updateById(), removeById()](#new_db-collectionjs-findbyid-updatebyid-removebyid)
         - [findById()](#new_db-collectionjs-findbyid-updatebyid-removebyid-findbyid)
         - [updateById()](#new_db-collectionjs-findbyid-updatebyid-removebyid-updatebyid)
         - [removeById()](#new_db-collectionjs-findbyid-updatebyid-removebyid-removebyid)
     - [cursor.js](#new_db-cursorjs)
       - [sort(), limit(), skip(), toArray(), count(), explain()](#new_db-cursorjs-sort-limit-skip-toarray-count-explain)
   - [utils.js](#utilsjs)
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
<a name="connect_db-collectionjs"></a>
## collection.js
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
<a name="connect_db-cursorjs-sort-limit-skip-toarray-count-explain"></a>
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

<a name="new_db"></a>
# new_db
<a name="new_db-collectionjs"></a>
## collection.js
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
<a name="new_db-cursorjs-sort-limit-skip-toarray-count-explain"></a>
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

