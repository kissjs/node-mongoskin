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
var servermanager = require('./utils/server_manager');

exports.describe = function(db) {

  describe('cursor.js', function () {

      var servers = null;
      var authfailServers = null;

      describe('sort(), limit(), skip(), toArray(), count(), explain()', function () {

        before(function (done) {
          db.bind('testCursor');
          var docs = [];
          for (var i = 0; i < 100; i++) {
            docs.push({name: 'name ' + i, index: i});
          }
          console.log(docs);
          db.testCursor.insert(docs, {safe:true}, function (err) {
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
            result.should.have.property('cursor', 'BasicCursor');
            result.should.have.property('nscanned', 100);
            result.should.have.property('nscannedObjects', 100);
            result.should.have.property('n', 49);
            done();
          });
        });

      });
  });
}
