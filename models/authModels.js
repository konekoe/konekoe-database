const mongoose = require('mongoose');

const USER_PERMISSIONS = ['client', 'staff', 'admin'];
const GROUP_PERMISSIONS = ['visitor', 'editor', 'manager'];

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
  permissions: { type: String, required: true, enum: USER_PERMISSIONS, default: 'client' }, //Highest level from aliases is chosen
  groups: [{ group: { type: ObjectID, ref: 'Group', required: true }, permissions: { type: String, required: true, enum: GROUP_PERMISSIONS, default: 'visitor' } }],
  aliases: [{ type: ObjectID, required: true }],
});

userSchema.virtual('userPermissions').get(function () {
  return USER_PERMISSIONS.indexOf(this.permissions);
});

//Use this to determine which groups a use belongs to and what is their numerical auth level.
//NOTE: admins are managers of all groups.
userSchema.methods.getGroups = function () {
  return (this.userPermissions > 1) ?
    Group.find({}).then(groups => groups.map(group => { return { group, permissions: { name: "admin", level: GROUP_PERMISSIONS.length } } }))
    :
    Promise.all(this.groups.map(({ group, permissions }) => {
      return { group: Group.findById(group), permissions: { name: permissions, level: GROUP_PERMISSIONS.indexOf(permissions) } };
    }));
};

userSchema.methods.getGroupPermissions = function(id) {

  const name = this.groups.find(g => g.group.toString() === id.toString()).permissions;
  return { name, level: GROUP_PERMISSIONS.indexOf(name) };
};

const User = mongoose.model('User', userSchema);



//An alias corresponds to a login method. Each alias has to have at least these properties;
const userAliasSchema = Schema({
  username: { type: String }, //student id etc.
  userId: { type: String, unique: true },
  parentUser: { type: ObjectID, ref: 'User', required: true },
  permissions: { type: String, required: true, enum: USER_PERMISSIONS, default: 'client' }
});

const UserAlias = mongoose.model('UserAlias', userAliasSchema);

const localAliasSchema = Schema({
  passwordHash: String,
  passwordSalt: String,
  permissions: { type: String, default: 'admin', enum: ['admin'] }
});

const LocalAlias = UserAlias.discriminator('LocalAlias', localAliasSchema);

const dummyAliasSchema = Schema({
  student: { type: ObjectID, ref: 'Student', required: true }
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
  Group,
  UserAlias,
  DummyAlias,
  LocalAlias,
  HakaAlias,
  AuthOption
};
