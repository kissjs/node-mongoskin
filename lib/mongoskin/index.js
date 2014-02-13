/*!
 * mongoskin - index.js
 *
 * Copyright(c) 2011 - 2012 kissjs.org
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var mongo = require('mongodb');

/*
 * exports mongo classes ObjectID Long Code DbRef ... to mongoskin
 */
for (var key in mongo) {
  exports[key] = mongo[key];
}

/*
 * export Skin classes from ./db ./collection ./cursor ./admin
 */
['client', 'server', 'db', 'collection', 'cursor', 'admin'].forEach(function (path) {
    var module = require('./' + path);
    for (var name in module) {
      if(name.indexOf('Skin') == 0) {
        exports[name] = module[name];
      }
    }
});
