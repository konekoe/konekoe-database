const mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectID = Schema.Types.ObjectId;

const authKeySchema = Schema({
  exam: { type: ObjectID, ref: "Exam", required: true },
  student: { type: ObjectID, ref: "Student", required: true },
});

module.exports = (conn) => {
  const AuthKey = conn.model('AuthKey', authKeySchema);
  
  return {
    AuthKey,
  };
};