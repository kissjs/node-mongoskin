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
var constant = require('../lib/constant');

exports.describe = function(db) {
  describe('admin.js', function() {
      var adminDb;
      before(function(){
          adminDb = db.admin();
      });
      it('should add the new user to the admin database', function(done) {
          adminDb.addUser('admin3', 'admin3', done);
      });

      it('should authenticate using the newly added user', function(done) {
          adminDb.authenticate('admin3', 'admin3', done);
      })

      it('should retrive the build information for the mongodb instance', function(done) {
          adminDb.buildInfo(done);
      })

      it('should remove user just added', function(done) {
          adminDb.removeUser('admin3', done);
      })
  });
}
