/*!
 * mongoskin - test/db.js
 *
 * Copyright(c) 2011 - 2012 kissjs.org
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */
var should = require('should');
var mongoskin = require('../');
var pedding = require('./utils/pedding');
var constant = require('../lib/mongoskin/constant');
var servermanager = require('./utils/server_manager');

describe('db.js', function () {

  var blackholePort = 24008;
  var blackhole = require('net').createServer(function (c) {
    // no reply, just for timeout
  });

  var RS, RS_primary;
  before(function (done) {
    done = pedding(2, done);
    servermanager.ensureUp(function (err, rs, primary) {
      RS = rs;
      RS_primary = primary;
      done(err);
    });
    blackhole.listen(blackholePort, done);
  });
  
  var cases = [
    ['normal', {database: 'mongoskin_test'}],
  ];
  if (servermanager.MONGOSKIN_REPLICASET) {
    cases.push(['replicaset', {database: 'mongoskin_replicaset_test'}]);
  }
  cases.forEach(function (caseItem) {
    describe(caseItem[0], function () {
      var isReplicaset = caseItem[0] === 'replicaset';
      var db = null;
      var servers = null;
      var authfailServers = null;
      var options = caseItem[1];
      var authfailOptions = {};
      for (var k in options) {
        authfailOptions[k] = options[k];
      }
      before(function () {
        if (isReplicaset) {
          servers = [];
          authfailServers = [];
          for (var i = 0; i < RS.ports.length; i++) {
            servers.push(RS.host + ':' + RS.ports[i] + '/?auto_reconnect=true');
          }
          authfailServers = servers;
          authfailOptions.username = 'test';
          authfailOptions.password = 'test';
        } else {
          servers = RS_primary;
          authfailServers = 'test:test@' + servers;
        }
        db = mongoskin.db(servers, options);
      });

      after(function () {
        db.close();
      });

      describe('bind()', function () {

        before(function (done) {
          var collection = db.collection('testExistsCollection');
          collection.insert({name: 'item1'}, {safe: true}, function (err) {
            done(err);
          });
        });

        after(function (done) {
          done = pedding(2, done);
          db.testExistsCollection.drop(done);
          if (db.testCollection) {
            return db.testCollection.drop(function () {
              done();
            });
          }
          done();
        });

        it('should throw error when collection name wrong', function () {
          var wrongNames = ['', null, 123, '    ', '\n   \t   ', undefined, 0, 1, new Date(), {}, []];
          wrongNames.forEach(function (name) {
            (function () {
              db.bind(name);
            }).should.throw('Must provide collection name to bind.');
          });
        });

        it('should throw error when options is not object', function () {
          (function () {
            db.bind('foo', function () {});
          }).should.throw('the args[1] should be object, but is `function () {}`');
        });

        it('should add helper methods to collection', function (done) {
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
        });

        it('should add options and helper methods to collection', function (done) {
          db.bind('testExistsCollection', {safe: true}, {
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
        });

        it('should throw error when bind collection not exists in safe mode', function (done) {
          db.bind('notExistsCollection', {safe: true});
          db.notExistsCollection.count(function (err, count) {
            should.exist(err);
            err.should.have.property('message', 'Collection notExistsCollection does not exist. Currently in strict mode.');
            should.not.exist(count);
            done();
          });
        });

      });

      describe('gridfs()', function () {
        it('should start gridfs store', function () {
          db.gridfs();
          db.should.have.property('skinGridStore');
        });
      });

      describe('open()', function () {

        it('should open a database connection', function (done) {
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
        });

        it('should open a database connection with user auth fail', function (done) {
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
        });

        it('should open 100 times ok', function (done) {
          var db3 = mongoskin.db(servers, options);
          done = pedding(100, done);
          for (var i = 0; i < 100; i++) {
            db3.open(function (err, db) {
              should.not.exist(err);
              should.exist(db);
              done();
            });
          }
        });

        it('should open timeout when connect the blackhole', function (done) {
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
        });
        
      });

      describe('close()', function () {
        it('should close a database connection', function (done) {
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
        });

        it('should close 100 times ok', function (done) {
          var db3 = mongoskin.db(servers, options);
          done = pedding(100, done);
          db.open();
          for (var i = 0; i < 100; i++) {
            db3.close(function (err) {
              should.not.exist(err);
              done();
            });
          }
        });
      });

      describe('ensureIndex()', function () {

        it('should index infos is empty', function (done) {
          var barDb = mongoskin.db(servers, options);
          barDb.indexInformation('not-exists', function (err, result) {
            should.not.exist(err);
            should.exist(result);
            result.should.eql({});
            done();
          });
        });

        it('should get index infos error', function (done) {
          var barDb = mongoskin.db(authfailServers, authfailOptions);
          barDb.indexInformation('not-exists', function (err, result) {
            should.exist(err);
            should.not.exist(result);
            done();
          });
        });

        it('should create title:1 index success', function (done) {
          db.ensureIndex('foo', {title: 1}, function (err, result) {
            should.not.exist(err);
            should.exist(result);
            result.should.equal('title_1');
            done();
          });
        });

        it('should create title:-1 index success', function (done) {
          db.ensureIndex('foo', {title: -1}, function (err, result) {
            should.not.exist(err);
            should.exist(result);
            result.should.equal('title_-1');
            done();
          });
        });

        it('should get all index infos', function (done) {
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
        });
      });

    });
  });
});