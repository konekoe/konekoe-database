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
                serverSelectionTimeoutMS: 5000
              };

// Support creating a mock for testing.
const MongoConnection = (mongod) ?  async (uri, options = dbOptions) => {
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

// Close a single connection.
// If this is a testing connection, drop the database entirely.
const closeConnection = async (connection) => {
  try {
    if (mongod)
      await connection.dropDatabase();
    
    await connection.close();
  }
  catch (err) {
    return Promise.reject(err);
  }
};

const closeConnections = async (connections) => {
  try {
    await Promise.all(connections.map(closeConnection));

    if (mongod)
      await mongod.stop();
  }
  catch (err) {
    return Promise.reject(err);
  }
};


// Data can be cleared for testing purposes.
const clearDataSingle = async (connection) => {
  const { collections } = connection;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

const clearData = async (connections) => Promise.all(connections.map(clearDataSingle));

module.exports = {
  MongoConnection,
  closeConnections,
  clearData
};
