<a name='index'>

* [Introduction](#introduction)
* [Goals](#goals)
* [Install](#install)
* [Documentation](#documentation)
    * [Module](#module)
    * [SkinServer](#skinserver)
    * [SkinDb](#skindb)
    * [SkinCollection](#skincollection)

<a name='Introduction'></a>

Introduction
========
**Mongoskin** is the future layer above [node-mongodb-native](https://github.com/christkv/node-mongodb-native)

    var mongo = require('mongoskin'),
        db = mongo.db('localhost:27017/test?auto_reconnect');

    db.collection('user').ensureIndex([['username', 1]], true, function(err, replies){});
    db.collection('posts').hint = 'slug';
    db.collection('posts').findOne({slug: 'whats-up'}, function(err, post){
        // do something
    });
    db.collection('posts').find().toArray(function(err, posts){
        // do something
    });

    db.bind('posts', {
       findTop10 : function(fn){
         this.find({}, {limit:10, sort:[['views', -1]]}).toArray(fn);
       },
       removeTagWith : function(tag, fn){
         this.remove({tags:tag},fn);
       }
    });

    db.posts.findTop10(function(err, topPosts){
      //do something
    });

    db.collection('posts').removeTagWith('delete', function(err, replies){
      //do something
    });

    db.posts.mapReduce(...);
    db.createCollection(...);

 **Is mongoskin synchronized?**

Nop! It is asynchronized, it use [future](http://en.wikipedia.org/wiki/Future_%28programming%29).

[Back to index](#index)

<a name='goals'>

Goals
========

Provide full features of [node-mongodb-native](https://github.com/christkv/node-mongodb-native),
and make it [future](http://en.wikipedia.org/wiki/Future_%28programming%29).

[Back to index](#index)

<a name='install'></a>

Install
========

Soon, not publish to npm yet.

[Back to index](#index)

<a name='documentation'>

Documentation
========

for more information, see the source.

[Back to index](#index)

<a name='module'>

Module
--------

### MongoSkin Url format

    [*://][username:password@]host[:port][/database][?auto_reconnect[=true|false]]`

e.g.

    localhost/blog
    mongo://admin:pass@127.0.0.1:27017/blog?auto_reconnect
    127.0.0.1?auto_reconnect=false


### bind(collectionName)

### bind(collectionName, SkinCollection)

### bind(collectionName, extendObject1, extendObject2 ...)

Bind SkinCollection to db properties. see [SkinDb.bind](#skindb-bind) for more information.

### db(databaseUrl)

Get or create instance of SkinDb.

### cluster(serverUrl1, serverUrl2, ...)

Create SkinServer of native ServerCluster. e.g.

    var mongo = require('mongoskin');
    var cluster = mongo.cluster('192.168.0.1:27017', '192.168.0.2:27017', '192.168.0.3:27017')
    var db = cluster.db('dbname', 'admin', 'pass');

### pair(leftServerUrl, rightServerUrl)

Create instance of native ServerPair

[Back to index](#index)

<a name='skinserver'>

SkinServer
--------

### SkinServer(server)

Construct SkinServer from native Server instance.

### db(dbname, username=null, password=null)

Construct SkinDb from SkinServer.

[Back to index](#index)

<a name='skindb'>

SkinDb
--------

### SkinDb(db, username=null, password=null)

Construct SkinDb.

### open(callback)

Connect to database, retrieval native Db instance, callback is function(err, db).

### collection(collectionName)

Retrieval SkinCollection instance of specified collection name.

<a name='skindb-bind'>

### bind(collectionName)

### bind(collectionName, SkinCollection)

### bind(collectionName, extendObject1, extendObject2 ...)

Bind SkinCollection to db properties as a shortcut to db.collection(name).
You can also bind additional methods to the SkinCollection, it is useful when
you want to reuse a complex operation. This will also affect 
db.collection(name) method.

e.g.

    db.bind('book', {
        firstBook: function(fn){
            this.findOne(fn);
        }
    });
    db.book.firstBook:(function(err, book){});

### all the methods from Db.prototype

See [Db](https://github.com/christkv/node-mongodb-native/blob/master/lib/mongodb/db.js#L17) of node-mongodb-native for more information.

[Back to index](#index)

<a name='skincollection'>

SkinCollection
--------

### open(callback)

Retrieval native Collection instance, callback is function(err, collection).

### id(hex)

Equivalent to 

    db.bson_serilizer.ObjectID.createFromHexString(hex);

### findItems(..., callback)

Equivalent to 

    collection.find(..., function(err, cursor){
        cursor.toArray(callback);
    });

### findEach(..., callback)

Equivalent to 

    collection.find(..., function(err, cursor){
        cursor.each(callback);
    });

### findById(id, ..., callback)

Equivalent to 

    collection.findOne({_id, ObjectID.createFromHexString(id)}, ..., callback);

### updateById(_id, ..., callback)

Equivalent to 

    collection.update({_id, ObjectID.createFromHexString(id)}, ..., callback);

### find(...)

If the last parameter is function, it is equivalent to native Collection.find 
method, else it will return a future SkinCursor.

e.g.

    // callback
    db.book.find({}, function(err, cursor){/* do something */});
    // future SkinCursor
    db.book.find().toArray(function(err, books){/* do something */});

### all the methods from Collection.prototype

See [Collection](https://github.com/christkv/node-mongodb-native/blob/master/lib/mongodb/collection.js#L45) of node-mongodb-native for more information.

    checkCollectionName
    count
    createIndex
    distinct
    drop
    dropIndex
    dropIndexes
    ensureIndex
    find
    findAndModify
    findOne
    group
    indexInformation
    insert
    insertAll
    mapReduce
    normalizeHintField
    options
    remove
    rename
    save
    update

[Back to index](#index)
