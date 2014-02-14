"use strict";

var GridStore = require('mongodb').GridStore;
var makeSkinClass = require('./utils').makeSkinClass;

var SkinGridStore = exports.SkinGridStore = makeSkinClass(GridStore);

SkinGridStore.prototype._open = function(callback) {
  var skin_db = this._construct_args[0];
  skin_db.open(function(err, p_db) {
      if(err) return callback(err);
      var args = ([null]).concat(this._construct_args);
      var ctor = GridStore.bind.apply(GridStore, args);
      var gridStore = new ctor();
      callback(null, gridStore);
  });
}
