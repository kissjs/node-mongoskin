/*!
 * mongoskin - test/admin.js
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
var SkinAdmin = require('../').SkinAdmin;

describe('admin.js', function () {

  var skinDb;
  beforeEach(function () {
    skinDb = {
      open: function (callback) {
        var that = this;
        process.nextTick(function () {
          callback(null, that.db);
        });
      },
      db: {
        name: 'mock db'
      }
    };
  });

  describe('open()', function () {

    it('should return admin', function (done) {
      var skinAdmin = new SkinAdmin(skinDb);
      skinAdmin.open(function (err, admin) {
        should.not.exist(err);
        should.exist(admin);
        should.exist(skinAdmin.admin);
        skinAdmin.open(function (err, admin) {
          should.not.exist(err);
          should.exist(admin);
          should.exist(skinAdmin.admin);
          done();
        });
      });
    });

    it('should return mock open() error', function (done) {
      skinDb.open = function (callback) {
        process.nextTick(function () {
          callback(new Error('mock open() error'));
        });
      };
      var skinAdmin = new SkinAdmin(skinDb);
      skinAdmin.open(function (err, admin) {
        should.exist(err);
        err.should.have.property('message', 'mock open() error');
        should.not.exist(admin);
        should.not.exist(skinAdmin.admin);
        done();
      });
    });

  });

});