/*!
 * mongoskin - test/utils/server_manager.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var MONGOSKIN_REPLICASET = process.env.MONGOSKIN_REPLICASET === 'true';
var RS = null;
var RS_primary = null;

exports.ensureUp = function (callback) {
  var ReplicaSetManager = require('../../deps/mongodb/test/tools/replica_set_manager').ReplicaSetManager;
  var ServerManager = require('../../deps/mongodb/test/tools/server_manager').ServerManager;
  // Create instance of replicaset manager but only for the first call
  if (!RS) {
    if (!MONGOSKIN_REPLICASET) {
      RS = new ServerManager();
      RS.start(true, {purgedirectories: true}, function (err) {
        RS_primary = '127.0.0.1:' + RS.port;
        callback(err, RS, RS_primary);
      });
    } else {
      RS = new ReplicaSetManager({retries: 120, secondary_count: 1, passive_count: 0, arbiter_count: 1});
      RS.startSet(true, function (err, result) {
        RS.primary(function (err, primary) {
          RS_primary = primary;
          callback(err, RS, RS_primary);
        });
      });
    }
    process.on('exit', function () {
      console.log('process exit, stop mongod...');
      RS.killAll(function () {});
    });
  } else {
    callback(null, RS, RS_primary);
  }
};

exports.ensureDown = function (callback) {
  callback();
  // if (RS) {
  //   RS.killAll(callback);
  // } else {
  //   callback();
  // }
};

exports.MONGOSKIN_REPLICASET = MONGOSKIN_REPLICASET;
