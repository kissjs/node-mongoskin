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
var constant = require('../lib/mongoskin/constant');
var SkinCursor = mongoskin.SkinCursor;

describe('cursor.js', function () {

  describe('new SkinCursor()', function () {
    it('should state is open when cursor exists', function () {
      var cursor = new SkinCursor({}, {});
      cursor.should.have.property('state', constant.STATE_OPEN);
    });
    it('should state is close when cursor not exists', function () {
      var cursor = new SkinCursor(null, {});
      cursor.should.have.property('state', constant.STATE_CLOSE);
    });
  });

  describe('open()', function () {
    var collection;
    beforeEach(function () {
      collection = {
        open: function (callback) {
          var that = this;
          process.nextTick(function () {
            callback(null, that);
          });
        },
        find: function () {
          var callback = arguments[arguments.length - 1];
          process.nextTick(function () {
            callback(null, {name: 'mock cursor'});
          });
        }
      };
    });

    it('should success when state is close', function (done) {
      var cursor = new SkinCursor(null, collection);
      cursor.open(function (err, mockCursor) {
        should.not.exist(err);
        mockCursor.should.have.property('name', 'mock cursor');
        done();
      });
    });

    it('should success when state is openning', function (done) {
      var cursor = new SkinCursor(null, collection);
      cursor.open(function (err, mockCursor) {
        should.not.exist(err);
        mockCursor.should.have.property('name', 'mock cursor');
      });
      cursor.open(function (err, mockCursor) {
        should.not.exist(err);
        mockCursor.should.have.property('name', 'mock cursor');
        done();
      });
    });

    it('should success when state is open', function (done) {
      var cursor = new SkinCursor({name: 'mock cursor 2'}, collection);
      cursor.open(function (err, mockCursor) {
        should.not.exist(err);
        mockCursor.should.have.property('name', 'mock cursor 2');
        done();
      });
    });

    it('should return mock error', function (done) {
      collection.open = function (callback) {
        process.nextTick(function () {
          callback(new Error('mock collection.open() error'));
        });
      };
      var cursor = new SkinCursor(null, collection);
      cursor.open(function (err, mockCursor) {
        should.exist(err);
        err.should.have.property('message', 'mock collection.open() error');
        should.not.exist(mockCursor);
        done();
      });
    });
  });

  describe('sort(), limit(), skip(), toArray(), count(), explain()', function () {
    var db = mongoskin.db('localhost/mongoskin_test');
    db.bind('testCursor');

    before(function (done) {
      var docs = [];
      for (var i = 0; i < 100; i++) {
        docs.push({name: 'name ' + i, index: i});
      }
      db.testCursor.insert(docs, function (err) {
        done(err);
      });
    });
    after(function (done) {
      db.testCursor.drop(done);
    });

    it('should cursor.skip(10).limit(10).toArray() return 10 rows', function (done) {
      db.testCursor.find().skip(10).limit(10).toArray(function (err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.should.be.instanceof(Array).with.length(10);
        rows[0].name.should.equal('name 10');
        rows[9].name.should.equal('name 19');
        done();
      });
    });

    it('should cursor.sort({index: -1}).skip(20).limit(10).toArray() return 10 rows', function (done) {
      db.testCursor.find().sort({index: -1}).skip(20).limit(10).toArray(function (err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.should.be.instanceof(Array).with.length(10);
        rows[0].name.should.equal('name 79');
        rows[9].name.should.equal('name 70');
        done();
      });
    });

    it('should cursor.count() return 100', function (done) {
      db.testCursor.find().count(function (err, count) {
        should.not.exist(err);
        count.should.equal(100);
        done();
      });
    });

    it('should cursor.explain() return 100', function (done) {
      db.testCursor.find({index: {$gt: 50}}).explain(function (err, result) {
        should.not.exist(err);
        result.should.eql({ cursor: 'BasicCursor',
        nscanned: 100,
        nscannedObjects: 100,
        n: 49,
        millis: 0,
        nYields: 0,
        nChunkSkips: 0,
        isMultiKey: false,
        indexOnly: false,
        indexBounds: {},
        allPlans: [ { cursor: 'BasicCursor', indexBounds: {} } ] });
        done();
      });
    });

  });

});