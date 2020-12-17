const mongoose = require("mongoose");

if (process.env.NODE_ENV === "test") {
  var { MongoMemoryServer } = require("mongodb-memory-server");
  var mongod = new MongoMemoryServer();
}

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
              };

// Support creating a mock for testing.
const MongoConnection = (mongod) ?  async (uri, options = dbOptions) => {
  console.log("hello");

  const testOptions = { 
    ...options,
    auth: null,
    pass: null,
    user: null
  };

  const testUri = await mongod.getUri();

  return mongoose.createConnection(testUri, testOptions);
}
: 
async (uri, options = dbOptions) => {
  return mongoose.createConnection(uri, options);
}

module.exports = MongoConnection;
