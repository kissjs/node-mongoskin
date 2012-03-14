var db = require('./config').db;

db.collection('test').insert({foo: 'bar'}, function(err, result) {
    console.log(result);
    db.close(function() {
        console.log('connection closed');
    });
});
