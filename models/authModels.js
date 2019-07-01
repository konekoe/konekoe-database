var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectID = Schema.Types.ObjectId;

var authOptionSchema = Schema({
  title: {type: String, unique: true, required: true},
  formPage: {type: String, required: true}
});

//This Schema is used to tie together documents associated with each login strategy.
var userSchema = Schema({
  accounts: [{id: {type: ObjectID, required: true}, userType: {type: String, required: true, enum: ['local', 'dummy', 'haka']}}],
});

var localUserSchema = Schema({
  username: {type: String, unique: true},
  passwordHash: String,
  passwordSalt: String,
  parentUser: {type: ObjectID, ref: 'User', required: true},
});

var dummyUserSchema = Schema({
  //StudentId
  username: {type: String, unique: true},
  student: {type: ObjectID, ref: 'Student', required: true},
  parentUser: {type: ObjectID, ref: 'User', required: true}
});

//Add desired eduPerson fields here.
//Remember to add these fields to the parser as well.
var hakaUserSchema = Schema({
  hakaId: {type: String, unique: true, required: true},
  username: {type: String},
  student: {type: ObjectID, ref: 'Student'},
  parentUser: {type: ObjectID, ref: 'User', required: true}
})

var User = mongoose.model('User', userSchema);
var DummyUser = mongoose.model('DummyUser', dummyUserSchema);
var LocalUser = mongoose.model('LocalUser', localUserSchema);
var HakaUser = mongoose.model('HakaUser', hakaUserSchema);
var AuthOption = mongoose.model('AuthOption', authOptionSchema);

module.exports = {User, DummyUser, LocalUser, HakaUser, AuthOption};
