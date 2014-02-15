"use strict";

var should = require('should');
var Grid = require('../').Grid; // SkinGrid
var Db = require('../').Db; // SkinDb
var constant = require('../lib/constant');
var assert = require('assert');

var i = 0;
exports.testWithDb = function(db) {
  function testGrid(descName, grid) {
    i++;
    describe(descName, function() {
        var id = 'test1' + i;
        // Some data to write
        var originalData = new Buffer('Hello world');
        before(function(done) {
            // Write data to grid
            grid.put(originalData, {_id: id}, function(err, result) {
                assert.equal(result._id, id);
                done(err);
            });
        })

        it('should write data to grid', function(done) {
            grid.put(originalData, {}, function(err, result) {
                should.not.exist(err);
                result._id.should.not.eql(id);
                done();
            });
        });

        it('should get data just put to grid', function(done) {
            grid.get(id, function(err, data) {
                assert.deepEqual(originalData.toString('base64'), data.toString('base64'));
                done(err);
            });
        })

        // it('should delete data from grid', function(done) {
        //     // Delete file
        //     grid.delete(id, function(err, result2) {
        //         should.not.exists(err);
        //         assert.equal(null, err);
        //         assert.equal(true, result2);

        //         // Fetch the content, showing that the file is gone
        //         grid.get(id, function(err, data) {
        //             should.not.exist(data);
        //             done(err);
        //         });
        //     });
        // })

    });
  }

  testGrid('db.grid()', db.grid());
  testGrid('new Grid(db, fsName)', new Grid(db, 'fs'));
}
