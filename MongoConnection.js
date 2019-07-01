const mongoose = require('mongoose');
const fs = require('fs');

//Connect to database
const dbUri = "mongodb://127.0.0.1:27017/testDb2";
const dbOptions =
              {
                auth: { authSource: "admin" },
                user: "superuser",
                pass: fs.readFileSync("./databasePass", 'utf8').trim(),
                useNewUrlParser: true
              }

const MongoConnection = (uri, options) => {
  return mongoose.connect(uri, options);
}

module.exports = MongoConnection(dbUri,dbOptions);
