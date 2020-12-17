exports.MongoConnection = require("./MongoConnection.js").MongoConnection;
exports.closeConnections = require("./MongoConnection.js").closeConnections;
exports.clearData = require("./MongoConnection.js").clearData;
exports.authModels = require("./models/authModels.js");
exports.examModels = require("./models/examModels.js");
exports.authKeyModels = require("./models/authKeyModels.js");
exports.exerciseModels = require("./models/exerciseModels.js");