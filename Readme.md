# mongoskin [![Build Status](https://secure.travis-ci.org/kissjs/node-mongoskin.png)](http://travis-ci.org/kissjs/node-mongoskin) [![Dependencies](https://david-dm.org/kissjs/node-mongoskin.png)](https://david-dm.org/kissjs/node-mongoskin)

![logo](https://raw.github.com/kissjs/node-mongoskin/master/logo.png)

This project is a wrapper for [node-mongodb-native](https://github.com/mongodb/node-mongodb-native).
The base API is same at the node-mongodb-native, you may want to familiarise yourself with the [node-mongodb-native documentation](http://mongodb.github.com/node-mongodb-native/) first.

## NOTE!! mongoskin API change from 1.3.20

Since node-mongodb-native has change a lot of API, mongoskin redesign from 1.3.20. The version number keep same with node-mongodb-native. And the API appearence is also keep same with node-mongodb-native

### Removed API from mongoskin 1.3.20
module.bind
module.Skin*
module.router
skinDb.toId
skinDb.toObjectId
skinDb.admin
skinDb.gridfs
skinCollection.bind

### Modified API from mongoskin 1.3.20
module.db
skinDb.bind


### Additional API from mongoskin 1.3.20
module.MongoClient
module.Grid
module.GridStore
module.helper.toObjectID

```js
var mongo = require('mongoskin');
var MongoClient = mongo.MongoClient;

var db = MongoClient.connect("mongodb://localhost:27017/integration_tests", {native_parser:true});
db.collection('mycollection').find().toArray(function(err, items) {
        db.close();
});
```

Use ReplSet

```js
var mongo = require('mongoskin');
var Server = mongo.Server;
var Db = mongo.Db;

var replSet = new ReplSetServers([
        new Server('localhost', 30000),
        new Server('localhost', 30001),
        new Server('localhost', 30002),
]);

var db = new Db('integration_test_', replSet, {w:0, native_parser: (process.env['TEST_NATIVE'] != null)});
// no need open and on('fullsetup', ...)
db.collection('myconnection').find().setReadPreference(ReadPreference.SECONDARY).toArray(function(err, items) {
        db.close();
});
```

## Basic API document
For detail API reference see [node mongodb API](http://mongodb.github.io/node-mongodb-native/). Mongoskin is just change the API call chain.

## Additional API by Mongoskin

collection.findById
collection.updateById
collection.removeById

## Automated tests

You can run the automated test by running <strong>make test</strong>. The tests have a coverage of [**89%**](http://fengmk2.github.com/coverage/mongoskin.html) and you can [browse the results](https://github.com/kissjs/node-mongoskin/blob/master/test_results.md).


Nodejs mongodb driver comparison
========

node-mongodb-native
--------

One of the most powerful Mongo drivers is node-mongodb-native. Most other drivers build
on top of it, including mongoskin. Unfortunately, it has an awkward interface with too many 
callbacks. Also, mongoskin provides helper method bindings on Collection instances.
  
See [mongodb-native](https://github.com/christkv/node-mongodb-native/tree/master/docs)

mongoose
--------

Mongoose provides a full blown ORM view of Collections and Models,
  and you are required to define a schema first. But why does mongodb need a schema?
  If you're like me, then you prefer to drive your schema from the application layer,
  and use fields without having had to define them beforehand.

  Mongoose also provides a data abstraction layer with validation support. Again, if you're like me, then
  you would prefer a lighter weight solution and to craft your own validation. I think this is the tao of mongodb.

mongoskin
--------

Mongoskin is an easy to use driver of mongodb for nodejs,
  it is similar with mongo shell, powerful like node-mongodb-native,
  and supports binding helper methods to Collections.

It provides the full features of [node-mongodb-native](https://github.com/christkv/node-mongodb-native),
  and makes good use of [futures](http://en.wikipedia.org/wiki/Future_%28programming%29).

For validation you can use [node-iform](https://github.com/guileen/node-iform).

Install
========

```bash
$ npm install mongoskin
```
Quick start
========

 **Is mongoskin synchronized?**

Nope! It is asynchronized, it use the [future pattern](http://en.wikipedia.org/wiki/Future_%28programming%29).
**Mongoskin** is the future layer above [node-mongodb-native](https://github.com/christkv/node-mongodb-native)

Easier to connect
--------
You can connect to mongodb easier now.

```js
var mongo = require('mongoskin');
mongo.db('localhost:27017/testdb').collection('blog').find().toArray(function (err, items) {
  console.dir(items);
})
```


Server options and BSON options
--------
You can also set `auto_reconnect` options querystring.
And native_parser options will automatically set if native_parser is available.

```js
var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/test?auto_reconnect');
```


Similar API to node-mongodb-native
--------
You can do everything that node-mongodb-native can do.

```js
db.createCollection(...);
db.collection('user').ensureIndex([['username', 1]], true, function (err, replies) {});
db.collection('posts').hint = 'slug';
db.collection('posts').findOne({slug: 'whats-up'}, function (err, post) {
  // do something
});
```


Easier cursor
--------

```js
db.collection('posts').find().toArray(function (err, posts) {
  // do something
});
```


MVC helpers
--------

You can bind **additional methods** for collection.
It is very useful if you want to use MVC patterns with nodejs and mongodb.
You can also invoke collection by properties after bind,
it could simplfy your `require`.

To keep your code in line with DRY principles, it's possible to create your own
data layer by for example, setting up your own validators and/or default values
inside the MVC methods as shown below in the config example

```js
db.bind('posts', {
  findTop10 : function (fn) {
   this.find({}, {limit:10, sort:[['views', -1]]}).toArray(fn);
  },
  removeTagWith : function (tag, fn) {
   this.remove({tags:tag},fn);
  }
 } 
});

db.bind('settings', {

  getAll: function(user, fn) {
  
  	this.find({user: user}).toArray(function(err, settings) {
  	
  	  // We want to set a default currency from within our app instead of storing it
  	  // for every user
  	  settings.currency = (typeof settings.currency !== "undefined") ? settings.currency : 'USD';
  		
  	  fn(err, settings);
  	
  	});
  }
});

     
db.bind('comments');

db.collection('posts').removeTagWith('delete', function (err, replies) {
  //do something
});

db.posts.findTop10(function (err, topPosts) {
  //do something
});

db.comments.find().toArray(function (err, comments) {
  //do something
});
```




API documentation
========

for more information, see the source.




Module
--------

### db(serverURL[s], dbOptions, replicasetOptions)

Get or create instance of [SkinDb](#skindb). 

Parameters:
* ```serverURLs``` can be a single mongoskin url, or an array of urls, each with the following format:
```[*://][username:password@]host[:port][/database][?auto_reconnect[=true|false]]```

* ```dbOptions``` is an object that can have following options in it:
    * ```database``` - the database to connect to. This overrides the database name passed in the url.
    * ```socketOptions``` - mongo socket options (see http://mongodb.github.com/node-mongodb-native/markdown-docs/database.html)
    * ```username``` - overrides the value set in the serverURl[s]
    * ```password``` - overrides the value set in the serverURl[s]
    * other parameters - see http://mongodb.github.io/node-mongodb-native/api-generated/db.html
* ```replicasetOptions``` - mongodb ReplSet options (see http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html). This is only useful if an array of urls is passed.

Examples:

```js
var a = mongoskin.db('localhost:27017/testdb?auto_reconnect=true&poolSize=5');
var b = mongoskin.db('mongo://admin:pass@127.0.0.1:27017/blog?auto_reconnect');
var c = mongoskin.db('127.0.0.1?auto_reconnect=false');
```

for ReplSet server

```js
var db = mongoskin.db([
  '192.168.0.1:27017/?auto_reconnect=true',
  '192.168.0.2:27017/?auto_reconnect=true',
  '192.168.0.3:27017/?auto_reconnect=true'
], {
  database: 'testdb',
  safe: true
}, {
  connectArbiter: false,
  socketOptions: {
    timeout: 2000
  }
});
```

## Authors

Below is the output from `git-summary`.

```
 project  : node-mongoskin
 repo age : 2 years, 10 months
 active   : 84 days
 commits  : 180
 files    : 44
 authors  :
    49	Lin Gui                 27.2%
    44	fengmk2                 24.4%
    34	guilin 桂林           18.9%
    23	Gui Lin                 12.8%
     5	guilin                  2.8%
     2	Raghu Katti             1.1%
     2	Merlyn Albery-Speyer    1.1%
     2	Paul Gebheim            1.1%
     2	Joakim B                1.1%
     2	François de Metz       1.1%
     1	Wout Mertens            0.6%
     1	Yuriy Nemtsov           0.6%
     1	fresheneesz             0.6%
     1	humanchimp              0.6%
     1	Alan Shaw               0.6%
     1	wmertens                0.6%
     1	Aneil Mallavarapu       0.6%
     1	Gustav                  0.6%
     1	Harvey McQueen          0.6%
     1	Joe Faber               0.6%
     1	Matt Perpick            0.6%
     1	Philmod                 0.6%
     1	Quang Van               0.6%
     1	Rakshit Menpara         0.6%
     1	Shawn Jonnet            0.6%
```

## License 

(The MIT License)

Copyright (c) 2011 - 2012 kissjs.org

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
