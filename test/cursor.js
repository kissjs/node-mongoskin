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
var constant = require('../lib/mongoskin/constant');
var SkinCursor = require('../').SkinCursor;

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

});