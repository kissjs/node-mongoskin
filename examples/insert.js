var mongoskin = require('../lib/mongoskin')
  , db = mongoskin.db('localhost/test');

db.collection('test').insert({foo: 'bar'}, function(err, result) {
    console.log(result);
    db.close(function() {
        console.log('connection closed');
    });
});
