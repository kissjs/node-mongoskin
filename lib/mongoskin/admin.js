/*!
 * mongoskin - admin.js
 * 
 * Copyright(c) 2011 - 2012 kissjs.org
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var Admin = require('mongodb').Admin;
var utils = require('./utils');

var SkinAdmin = exports.SkinAdmin = function (skinDb) {
  this.skinDb = skinDb;
  this.admin = null;
};

SkinAdmin.prototype.open = function (callback) {
  if (this.admin) {
    return callback(null, this.admin);
  }
  this.skinDb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    this.admin = new Admin(db);
    callback(null, this.admin);
  }.bind(this));
};

for (var key in Admin.prototype) {
  var method = Admin.prototype[key];
  utils.bindSkin('SkinAdmin', SkinAdmin, 'admin', key, method);
}