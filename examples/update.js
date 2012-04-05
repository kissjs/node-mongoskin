var db = require('./config').db;
var articles = db.collection('articles');
articles.insert({foo: 'bar', val: 'val1'}, function(err, result) {

    console.log(result);
    articles.update({foo:'bar'}, {foo: 'bar', val:'val2'}, function(err, result) {

        console.log(result);
        articles.find({foo: 'bar'}).toArray(function(err, docs){

            console.log(docs);
            db.close(function() {
                console.log('connection closed');
            });

        });

    })

});
