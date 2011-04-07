
Install
========

Soon, not publish to npm yet.

Introduction
========
**Mongoskin** is the future layer above [node-mongodb-native](https://github.com/christkv/node-mongodb-native)

    var mongo = require('mongoskin');
    mongo.db('localhost/test-database').collection('articls').insert({a:1}, function(err, replies){
        console.dir(replies);
    });

Is mongoskin synchronized?
========

Nop! It is [future](http://en.wikipedia.org/wiki/Future_(programming))

Goals
========

Provide full features of [node-mongodb-native](https://github.com/christkv/node-mongodb-native),
and make it [future](http://en.wikipedia.org/wiki/Future_(programming)).

Documentation
========
* [Module API](#module-api)
* [SkinServer](#skinserver)
* [SkinDb](#skindb)
* [SkinCollection](#skincollection)

for more information, see the source.

Module API
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

Bind SkinCollection to db properties. see [SkinDb.bind](#bindcollectionname) for more information.

### db(databaseUrl)

Get or create instance of SkinDb.

### cluster(serverUrl1, serverUrl2, ...)

Create SkinServer of native ServerCluster. e.g.

    var mongo = require('mongoskin');
    var cluster = mongo.cluster('192.168.0.1:27017', '192.168.0.2:27017', '192.168.0.3:27017')
    var db = cluster.db('dbname', 'admin', 'pass');

### pair(leftServerUrl, rightServerUrl)

Create instance of native ServerPair


SkinServer
--------

### SkinServer(server)

Construct SkinServer from native Server instance.

### db(dbname, username=null, password=null)

Construct SkinDb from SkinServer.


SkinDb
--------

### SkinDb(db, username=null, password=null)

Construct SkinDb.

### open(callback)

Connect to database, retrieval native Db instance, callback is function(err, db).

### collection(collectionName)

Retrieval SkinCollection instance of specified collection name.

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

See [node-mongodb-native](https://github.com/christkv/node-mongodb-native) for more information.

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

See [node-mongodb-native](https://github.com/christkv/node-mongodb-native) for more information.

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
