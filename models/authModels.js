const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectID = Schema.Types.ObjectId;

const authOptionSchema = Schema({
  title: { type: String, unique: true, required: true },
  formPage: { type: String, required: true }
});

//This Schema is used to tie together documents associated with each login strategy.
const userSchema = Schema({
  privileges: { type: String, required: true, enum: ['student', 'assistant', 'teacher', 'maintainer'], default: 'student' }, //Highest level of accounts is chosen
  aliases: [{
     id: { type: ObjectID, required: true },
     userType: { type: String, required: true, enum: ['local', 'dummy', 'haka'] }
  }],
});

//An alias corresponds to a login method. Each alias has to have at least these properties;
const userAliasSchema = Schema({
  username: { type: String, unique: true },
  parentUser: { type: ObjectID, ref: 'User', required: true },
  privileges: { type: String, required: true, enum: ['student', 'assistant', 'teacher', 'maintainer'], default: 'student' }
});

const localAliasSchema = Schema({
  passwordHash: String,
  passwordSalt: String,
  privileges: { default: "maintainer", enum: ["maintainer"] }
});

const dummyAliasSchema = Schema({
  student: { type: ObjectID, ref: 'Student', required: true },
  privileges: { default: "student", enum: ["student"] }
});

//Add desired eduPerson fields here.
//Remember to add these fields to the parser as well.
const hakaAliasSchema = Schema({
  hakaId: { type: String, unique: true, required: true },
  student: { type: ObjectID, ref: 'Student' },
});

const User = mongoose.model('User', userSchema);
const UserAlias = mongoose.model('UserAlias', userAliasSchema);
const DummyAlias = UserAlias.discriminator('DummyAlias', dummyAliasSchema);
const LocalAlias = UserAlias.discriminator('LocalAlias', localAliasSchema);
const HakaAlias = UserAlias.discriminator('HakaAlias', hakaAliasSchema);
const AuthOption = mongoose.model('AuthOption', authOptionSchema);

module.exports = { User, DummyAlias, LocalAlias, HakaAlias, AuthOption };
