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

var mongoskin = require('../');
var should = require('should');

describe('db.js', function () {

  var db = mongoskin.db('localhost/mongoskin_test');

  after(function () {
    db.close();
  });

  describe('bind()', function () {

    after(function () {
      if (db.testCollection) {
        db.testCollection.drop();
      }
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

  });

  describe('gridfs()', function () {
    it('should start gridfs store', function () {
      db.gridfs();
      db.should.have.property('skinGridStore');
    });
  });

  describe('open()', function () {

    it('should open a database connection', function (done) {
      var db1 = mongoskin.db('localhost/mongoskin_test');
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
      var db2 = mongoskin.db('test:test@localhost/mongoskin_test');
      db2.open(function (err, db) {
        should.exist(err);
        err.should.have.property('message', 'auth fails');
        err.should.have.property('name', 'MongoError');
        should.not.exist(db);
      });
      db2.open(function (err, db) {
        should.exist(err);
        err.should.have.property('message', 'auth fails');
        err.should.have.property('name', 'MongoError');
        should.not.exist(db);
        done();
      });
    });

    it('should open 100 times ok', function (done) {
      var db3 = mongoskin.db('localhost/mongoskin_test');
      var counter = 0;
      for (var i = 0; i < 100; i++) {
        db3.open(function (err, db) {
          should.not.exist(err);
          should.exist(db);
          counter++;
          if (counter === 100) {
            done();
          }
        });
      }
    });
    
  });

  describe('close()', function () {
    it('should close a database connection', function (done) {
      var dbClose = mongoskin.db('localhost/mongoskin_test');
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
      var db3 = mongoskin.db('localhost/mongoskin_test');
      var counter = 0;
      db.open();
      for (var i = 0; i < 100; i++) {
        db3.close(function (err) {
          should.not.exist(err);
          counter++;
          if (counter === 100) {
            done();
          }
        });
      }
    });
  });

  describe('ensureIndex()', function () {

    it('should index infos is empty', function (done) {
      var barDb = mongoskin.db('localhost/mongoskin_test');
      barDb.indexInformation('not-exists', function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.eql({});
        done();
      });
    });

    it('should get index infos error', function (done) {
      var barDb = mongoskin.db('test:test@localhost/mongoskin_test');
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