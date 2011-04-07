var Admin = require('mongodb').Admin;

var SkinAdmin = exports.SkinAdmin = function(db) {
  this.db = db;
  this.nativeAdmin = new Admin(this.db.nativeDb);
}

var bindSkin = function(name, method) {
  SkinAdmin.prototype[name] = function() {
    var args = arguments.length > 0 ? Array.prototype.slice.call(arguments, 0) : [];
    return this.db.open(function(err, db) {
      if (err) {
        args[args.length - 1](err);
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
