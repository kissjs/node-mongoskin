# TOC
   - [collection.js](#collectionjs)
     - [id()](#collectionjs-id)
     - [find(), findItems(), findEach()](#collectionjs-find-finditems-findeach)
       - [mock find() error](#collectionjs-find-finditems-findeach-mock-find-error)
     - [findById(), updateById(), removeById()](#collectionjs-findbyid-updatebyid-removebyid)
       - [findById()](#collectionjs-findbyid-updatebyid-removebyid-findbyid)
       - [updateById()](#collectionjs-findbyid-updatebyid-removebyid-updatebyid)
       - [removeById()](#collectionjs-findbyid-updatebyid-removebyid-removebyid)
<a name="" />
 
<a name="collectionjs" />
# collection.js
<a name="collectionjs-id" />
## id()
should convert string id to ObjectID success.

```jsvar id = '4ec4b2b9f44a927223000001';
id = db.testcollection.id(id);
id.should.be.instanceof(db.testcollection.ObjectID);
id = db.testcollection.id(id);
id.should.be.instanceof(db.testcollection.ObjectID);
id = '4ec4b2b9f44a927223000foo';
id = db.testcollection.id(id);
id.should.be.instanceof(db.testcollection.ObjectID);
```

should return source id when id length !== 24.

```jsvar ids = [123, '4ec4b2b9f44a92722300000', 'abc', '4ec4b2b9f44a927223000f00123123'];
ids.forEach(function (id) {
  db.testcollection.id(id).should.equal(id);
});
```

<a name="collectionjs-find-finditems-findeach" />
## find(), findItems(), findEach()
should find().toArray() return 100 comments.

```jsdb.comment.find().toArray(function (err, rows) {
  should.not.exist(err);
  rows.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems(fn) all comments.

```jsdb.comment.findItems(function (err, comments) {
  should.not.exist(err);
  should.exist(comments);
  comments.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems({} fn) all comments.

```jsdb.comment.findItems(function (err, comments) {
  should.not.exist(err);
  should.exist(comments);
  comments.should.be.instanceof(Array).with.length(100);
  done();
});
```

should findItems({limit: 10}) query wrong return top 0 comments.

```jsdb.comment.findItems({limit: 10}, function (err, comments) {
  should.not.exist(err);
  comments.should.be.instanceof(Array).with.length(0);
  done();
});
```

should findItems({}, {limit: 10}) return top 10 comments.

```jsdb.comment.findItems({}, {limit: 10}, function (err, comments) {
  should.not.exist(err);
  comments.should.be.instanceof(Array).with.length(10);
  done();
});
```

should findEach(fn) call fn 100 times.

```jsvar count = 0;
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

```jsvar count = 0;
db.comment.findEach({}, {limit: 20}, function (err, comment) {
  should.not.exist(err);
  if (!comment) {
    count.should.equal(20);
    return done();
  }
  count++;
});
```

<a name="collectionjs-find-finditems-findeach-mock-find-error" />
### mock find() error
should findItems() error.

```jsdb.comment.findItems(function (err, docs) {
  should.exist(err);
  err.should.be.instanceof(Error).with.have.property('message', 'mock find() error');
  should.not.exist(docs);
  done();
});
```

should findEach() error.

```jsdb.comment.findEach(function (err, docs) {
  should.exist(err);
  err.should.be.instanceof(Error).with.have.property('message', 'mock find() error');
  should.not.exist(docs);
  done();
});
```

<a name="collectionjs-findbyid-updatebyid-removebyid" />
## findById(), updateById(), removeById()
<a name="collectionjs-findbyid-updatebyid-removebyid-findbyid" />
### findById()
should find one object by ObjectID.

```jsdb.article.findById(articleId, function (err, article) {
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

```jsdb.article.findById(articleId.toString(), function (err, article) {
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

```jsdb.article.findById('foo', function (err, article) {
  should.not.exist(err);
  should.not.exist(article);
  done();
});
```

<a name="collectionjs-findbyid-updatebyid-removebyid-updatebyid" />
### updateById()
should update obj by id.

```jsvar updatedTime = new Date();
var doc = {
  $set: {
    title: 'new title ' + updatedTime,
    updated_at: updatedTime
  }
};
db.article.updateById(articleId.toString(), doc, function (err, article) {
  should.not.exist(err);
  should.not.exist(article);
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

<a name="collectionjs-findbyid-updatebyid-removebyid-removebyid" />
### removeById()
should remove obj by id.

```jsvar id = articleId.toString();
db.article.findById(id, function (err, article) {
  should.not.exist(err);
  should.exist(article);
  db.article.removeById(id, function (err, article) {
    should.not.exist(err);
    should.not.exist(article);
    db.article.findById(id, function (err, article) {
      should.not.exist(err);
      should.not.exist(article);
      done();
    });
  });
});
```

