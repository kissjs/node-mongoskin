var mongo = require('../');
var MongoClient = mongo.MongoClient;
var Db = mongo.Db;
var Server = mongo.Server;
var ReplSetServers = mongo.ReplSetServers;

require('./helper');
var testCollection  = require('./collection');
var testCursor = require('./cursor');

var connect_db = MongoClient.connect('mongodb://127.0.0.1:27017/connect_db');
var new_db = new Db('new_db', new Server('127.0.0.1', 27017), {safe:true});
var repl_db = new Db('repl_db', new ReplSetServers([
      new Server('127.0.0.1', 27017)
]), {w:0, native_parser: true});


;[['connect_db', connect_db],['new_db', new_db]].forEach(function(dbdesc) {
    var db = dbdesc[1];
    describe(dbdesc[0], function() {
        ;[testCollection, testCursor].forEach(function(mod) {
            mod.describe(db);
        })
        after(function (done) {
            db.close(done);
        });
    })
})
