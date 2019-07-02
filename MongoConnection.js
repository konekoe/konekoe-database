const mongoose = require('mongoose');

//Connect to database
const dbUri = process.env.DATABASE_URI;
const dbOptions =
              {
                auth: { authSource: process.env.DATABASE_AUTH },
                user: process.env.DATABASE_USER,
                pass: process.env.DATABASE_PASS,
                useNewUrlParser: true,
                useCreateIndex: true
              }

const MongoConnection = (uri, options) => {
  return mongoose.connect(uri, options)
    .then(() => console.log("Connected to database."));
}

module.exports = MongoConnection(dbUri, dbOptions);
