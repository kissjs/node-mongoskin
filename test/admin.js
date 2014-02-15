"use strict";

var should = require('should');
var Admin = require('../').Admin; // SkinAdmin
var Db = require('../').Db; // SkinDb

exports.testWithDb = function(db) {
  function testAdmin(descName, adminDb) {
    describe(descName, function() {
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

  testAdmin('db.admin()', db.admin());
  testAdmin('new Admin(db)', new Admin(db));
}
