var url = require('url'),
    Router = require('./router').Router,
    mongo = require('mongodb'),
    SkinServer = require('./server').SkinServer,
    SkinDb =require('./db').SkinDb,
    Db = mongo.Db,
    Server = mongo.Server,
    ServerCluster = mongo.ServerCluster,
    ServerPair = mongo.ServerPair,
    BSONNative = mongo.BSONNative,
    DEFAULT_PORT = 27017;

/**
 * parse the database url to config
 *
 * [*://]username:password@host[:port]/database?options
 *
 */
var parseUrl = function(serverUrl) {
  var serverUrl = /\w+:\/\//.test(serverUrl) ? serverUrl : 'db://' + serverUrl,
      uri = url.parse(serverUrl, true),
      config = {},
      serverOptions = uri.query,
      reconnect = serverOptions['auto_reconnect'];

  config.host = uri.hostname;
  config.port = Number(uri.port) || DEFAULT_PORT;
  config.database = uri.pathname.replace(/\//g, '');
  config.options = {};
  config.options['auto_reconnect'] = reconnect !== undefined &&
    reconnect != 'false' && reconnect != 'no' && reconnect != 'off';
  if (uri && uri.auth) {
    var auth = uri.auth.split(':');
    config.username = auth[0];
    config.password = auth[1];
  }
  return config;
};

/**
 * constructor Server from url
 *
 */
var parseServer = function(serverUrl) {
  var config = parseUrl(serverUrl);
  return new Server(config.host, config.port, config.options);
};

function MongoSkin() {
}

/**
 * constructor SkinDb from serverUrl
 */
MongoSkin.prototype.db = function(serverUrl, options) {
  var config = parseUrl(serverUrl);
  if (!config.database) {
    throw new Error('Please provide a database to connect to.');
  }
  var server = new Server(config.host, config.port, config.options);
  var skinServer = new SkinServer(server);

  if(!options) {
    options = {};
  }
  if(options.username === undefined) {
    options.username = config.username;
    options.password = config.password;
  }
  return skinServer.db(config.database, options);
};

/**
 * select different db by collection name
 *
 * @param select function(name) returns SkinDb
 *
 * var router = mongoskin.router(function(name){
 *      select(name){
 *      case 'user':
 *      case 'group':
 *          return authDb;
 *      default:
 *          return appDb;
 *      }
 * });
 *
 * router.collection('user')
 *
 */
MongoSkin.prototype.router = function(select) {
  return new Router(select);
}

var mongoskin = new MongoSkin();

/*
 * export Skin classes from ./db ./collection ./cursor ./admin
 */
['server', 'db', 'collection', 'cursor', 'admin'].forEach(function(path) {
  var foo, module, name;
  module = require('./' + path);
  for (name in module) {
    foo = module[name];
    mongoskin[name] = foo;
  }
});

module.exports = mongoskin;

