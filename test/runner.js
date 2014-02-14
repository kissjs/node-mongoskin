var mongo = require('../');
var MongoClient = mongo.MongoClient;
var Db = mongo.Db;
var Server = mongo.Server;
var ReplSetServers = mongo.ReplSetServers;

require('./helper');
var testcollection  = require('./collection');

var connect_db = MongoClient.connect('mongodb://127.0.0.1:27017/connect_db');
var new_db = new Db('new_db', new Server('127.0.0.1', 27017), {safe:true});
var repl_db = new Db('repl_db', new ReplSetServers([
      new Server('127.0.0.1', 27017)
]), {w:0, native_parser: true});

testcollection.describe('MongoClient.connect', connect_db);
testcollection.describe('new_Db', new_db);
// testcollection.describe('replSet', repl_db);
