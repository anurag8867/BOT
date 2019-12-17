var MongoClient = require('mongodb').MongoClient,
    config = require('../../config');

exports.post = function (query, next) {
    try {
        MongoClient.connect("mongodb://localhost:27017/", (err, db) => {
            var dbo = db.db(config.databaseName);
            dbo.collection(config.collectionName.messages).insertOne(query, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    next(null, result);
                }
            });
        });
    } catch (e) {
        console.log("An Exception occured while inserting the record", e)
        next(e);
    }
};
