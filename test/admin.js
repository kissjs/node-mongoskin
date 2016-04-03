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
          adminDb.logout(function(err, result) {
            adminDb.authenticate('admin3', 'admin3', done);
          });
        })

        it('should remove user just added', function(done) {
            adminDb.removeUser('admin3', done);
        })

        it('should ping', function(done) {
          adminDb.ping(function(error, res) {
            done(error && !!res);
          });
        });
    });
  }

  testAdmin('db.db("admin")', db.admin());
  testAdmin('new Admin(db)', new Admin(db));
}
