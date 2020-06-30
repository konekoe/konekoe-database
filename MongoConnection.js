const mongoose = require('mongoose');

//Connect to database
const dbOptions =
              {
                auth: { authSource: process.env.DATABASE_AUTH },
                user: process.env.DATABASE_USER,
                pass: process.env.DATABASE_PASS,
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
              }

const MongoConnection = (uri, options = dbOptions) => {
  return mongoose.createConnection(uri, options)
    .then(() => {
      return mongoose.connection;
    });
}

module.exports = MongoConnection;
