var MongoClient = require('mongodb').MongoClient,
    config = require('../../config');

MongoClient.connect("mongodb://localhost:27017/", function (err, db) {
  if (err) throw err;
  var dbo = db.db(config.databaseName);
  dbo.collection(config.collectionName.users).createIndex({"id": 1}, {unique: true}, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Cool");
    }
    db.close();
  });
});

exports.post = function (query, next) {
  try {
    MongoClient.connect("mongodb://localhost:27017/", (err, db) => {
      var dbo = db.db(config.databaseName);
      dbo.collection(config.collectionName.users).insertOne(query, {unique: true}, function (err, result) {
        if (err) {
          next(err);
        } else {
          next(null, result);
        }
      });
    });

  } catch (e) {
    console.log("An Exception occured while inserting the record", e);
    next(e);
  }
};

exports.put = function (query, updateQuery, options, next) {
  try {
    MongoClient.connect("mongodb://localhost:27017/", (err, db) => {
      var dbo = db.db(config.databaseName);
      dbo.collection(config.collectionName.users).update(query, updateQuery, options, function (err, result) {
        if (err) {
          next(err);
        } else {
          next(null, result);
        }
      });
    });

  } catch (e) {
    console.log("An Exception occured while inserting the record", e);
    next(e);
  }
};

exports.get = function (query, next) {
  try {
    MongoClient.connect("mongodb://localhost:27017/", (err, db) => {
      var dbo = db.db(config.databaseName);
      dbo.collection(config.collectionName.users).findOne(query, function(err, result) {
        if (err) {
          next(err, null);
        } else {
          next(null, result);
        }
      });
    });
  } catch (e) {
    console.log("An Exception occured while searching the record", e);
    next(e);
  }
};
