var mongo = require('../');
var MongoClient = mongo.MongoClient;
var Db = mongo.Db;
var Server = mongo.Server;

require('./helper');

var connect_db = MongoClient.connect('mongodb://127.0.0.1:27017/connect_db');
var new_db = new Db('new_db', new Server('127.0.0.1', 27017), {safe:true});

function testDb(caseName, db) {
  describe(caseName, function() {
      ;[
        require('./db'),
        require('./collection'),
        require('./cursor'),
        require('./admin'),
        require('./grid_store')
      ].forEach(function(mod) {
          mod.testWithDb(db);
      })

      after(function (done) {
          db.close(done);
      });
  })
}

testDb('connect_db', connect_db);
testDb('new_db', new_db);
