const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectID = Schema.Types.ObjectId;

const authOptionSchema = Schema({
  title: { type: String, unique: true, required: true },
  formPage: { type: String, required: true }
});

const AuthOption = mongoose.model('AuthOption', authOptionSchema);

const groupSchema = Schema({
  courses: [{ type: ObjectID, ref: 'Course' }],
  name: { type: String, unique: true, required: true }
});

const Group = mongoose.model('Group', groupSchema);

//This Schema is used to tie together documents associated with each login strategy.
const userSchema = Schema({
  permissions: { type: String, required: true, enum: ['client', 'staff', 'maintainer'], default: 'client' }, //Highest level from aliases is chosen
  groups: [{ group: { type: ObjectID, ref: 'Group', required: true }, persmissions: { type: String, required: true, enum: ['visitor', 'editor', 'manager'] } }],
  aliases: [{ type: ObjectID, required: true }],
});

const User = mongoose.model('User', userSchema);

userSchema.virtual('userPermissions').get(function () {
  return ['client', 'staff', 'maintainer'].indexOf(this.permissions);
});

//Use this to determine which groups a use belongs to and what is their numerical auth level.
//NOTE: maintainers are managers of all groups.
userSchema.methods.getGroups = function () {
  const persmissionsEnum = ['visitor', 'editor', 'manager'];

  return (this.userPermissions > 1) ?
    Group.find({}).then(groups => groups.map(group => { return { group, permissions: persmissionsEnum.length } }))
    :
    Promise.all(this.groups.map(({ group, persmissions }) => {
      return { group: Group.findById(group), permissions: persmissionsEnum.indexOf(permissions) }
    }));
};


//An alias corresponds to a login method. Each alias has to have at least these properties;
const userAliasSchema = Schema({
  username: { type: String }, //student id etc.
  userId: { type: String, unique: true },
  parentUser: { type: ObjectID, ref: 'User', required: true },
  permissions: { type: String, required: true, enum: ['client', 'staff', 'maintainer'], default: 'client' }
});

const UserAlias = mongoose.model('UserAlias', userAliasSchema);

const localAliasSchema = Schema({
  passwordHash: String,
  passwordSalt: String,
  permissions: { type: String, default: 'maintainer', enum: ['maintainer'] }
});

const LocalAlias = UserAlias.discriminator('LocalAlias', localAliasSchema);

const dummyAliasSchema = Schema({
  student: { type: ObjectID, ref: 'Student', required: true },
  permissions: { type: String, default: 'client', enum: ['client'] }
});

const DummyAlias = UserAlias.discriminator('DummyAlias', dummyAliasSchema);

//Add desired eduPerson fields here.
//Remember to add these fields to the parser as well.
const hakaAliasSchema = Schema({
  student: { type: ObjectID, ref: 'Student' },
});

const HakaAlias = UserAlias.discriminator('HakaAlias', hakaAliasSchema);


module.exports = {
  User,
  UserAlias,
  DummyAlias,
  LocalAlias,
  HakaAlias,
  AuthOption
};
