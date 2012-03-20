var Admin = require('mongodb').Admin
  , utils = require('./utils');

var SkinAdmin = exports.SkinAdmin = function(skinDb) {
  this.skinDb = skinDb;
  this.nativeAdmin = new Admin(this.skinDb.nativeDb);
}

var bindSkin = function(name, method) {
  SkinAdmin.prototype[name] = function() {
    var args = arguments.length > 0 ? Array.prototype.slice.call(arguments, 0) : [];
    return this.skinDb.open(function(err, db) {
      if (err) {
        utils.error(err, args, 'SkinAdmin.' + name);
      } else {
        method.apply(this.nativeAdmin, args);
      }
    });
  };
};

for (var name in Admin.prototype) {
  var method = Admin.prototype[name];
  bindSkin(name, method);
}

exports.SkinAdmin = SkinAdmin;
