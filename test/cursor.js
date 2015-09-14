/*!
 * mongoskin - test/cursor.js
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
var SkinCursor = mongoskin.SkinCursor;
var servermanager = require('./utils/server_manager');

exports.testWithDb = function(db) {

  describe('cursor.js', function () {
    // DO NOT use db.bind('testCursor') here, will not create SkinCursor if collection already open.
    // use db.collection('testCursor').find() to create SkinCursor every time
    before(function (done) {
      var docs = [];
      for (var i = 0; i < 100; i++) {
        docs.push({name: 'name ' + i, index: i});
      }
      db.collection('testCursor').insert(docs, {safe:true}, function (err) {
        done(err);
      });
    });
    after(function (done) {
      db.collection('testCursor').drop(done);
    });

    it('should call toArray()', function(done) {
      db.collection('testCursor').find().toArray(function(err, items) {
        should.not.exist(err);
        items.should.be.instanceof(Array).with.length(100);
        done();
      });
    });
    it('should cursor.skip(10).limit(10).toArray() return 10 rows', function (done) {
      db.collection('testCursor').find().skip(10).limit(10).toArray(function (err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.should.be.instanceof(Array).with.length(10);
        rows[0].name.should.equal('name 10');
        rows[9].name.should.equal('name 19');
        done();
      });
    });

    it('should cursor.sort({index: -1}).skip(20).limit(10).toArray() return 10 rows', function (done) {
      db.collection('testCursor').find().sort({index: -1}).skip(20).limit(10).toArray(function (err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.should.be.instanceof(Array).with.length(10);
        rows[0].name.should.equal('name 79');
        rows[9].name.should.equal('name 70');
        done();
      });
    });

    it('should cursor.count() return 100', function (done) {
      db.collection('testCursor').find().count(function (err, count) {
        should.not.exist(err);
        count.should.equal(100);
        done();
      });
    });

    it('should cursor.explain() return 100', function (done) {
      db.collection('testCursor').find({index: {$gt: 50}}).explain(function(err, result) {
        should.not.exist(err);
        if (result.executionStats) {
          // mongodb >= 3.0
          result.executionStats.
            should.have.property('totalDocsExamined');
          result.executionStats.
            should.have.property('nReturned');
        } else {
          result.should.have.property('cursor', 'BasicCursor');
        }
        done();
      });
    });
  });
}
