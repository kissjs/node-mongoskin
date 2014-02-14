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

var SkinAdmin = exports.SkinAdmin = utils.makeSkinClass(Admin, false);

SkinAdmin.prototype._open = function(callback) {
  this._skin_db.open(function(err, p_db) {
      if(err) return callback(err);
      callback(null, p_db.admin());
  })
}
