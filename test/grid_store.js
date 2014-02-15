"use strict";

var should = require('should');
var GridStore = require('../').GridStore; // SkinGridStore
var Db = require('../').Db; // SkinDb
var ObjectID = require('../').ObjectID;
var constant = require('../lib/constant');
var assert = require('assert');

exports.testWithDb = function(db) {
  // Our file ID
  var fileId = new ObjectID();

  describe('grid_store.js', function() {
      // Open a new file
      var gridStore = new GridStore(db, fileId, 'w');
      var originData = 'Hello world';
      it('should write data to file', function(done) {
          // Write a text string
          gridStore.write(originData, function(err) {
              gridStore.close(done);
          });
      });

      it('should read file', function (done) {
          // use mongoskin style to create gridStore
          db.gridStore(fileId, 'r').read(function(err, data) {
              should.not.exist(err);
              data.toString().should.equal(originData);
              done();
          })
      });

      it('should execute GridStore static methods', function(done) {
          GridStore.exist(db, fileId, done)
      })

      // it('should unlink the file', function(done) {
      //     // reuse previous write mode gridStore;
      //     gridStore.unlink(function(err, result) {
      //         assert.equal(null, err);

      //         // Verify that the file no longer exists
      //         GridStore.exist(db, fileId, function(err, result) {
      //             assert.equal(null, err);
      //             assert.equal(false, result);
      //             done(err);
      //         });
      //     });
      // })

  })
};
