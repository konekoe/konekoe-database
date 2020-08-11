const mongoose = require('mongoose');


module.exports = (conn) => {

  const USER_PERMISSIONS = ['client', 'staff', 'admin'];
  const GROUP_PERMISSIONS = ['visitor', 'editor', 'manager'];

  const Schema = mongoose.Schema;
  const ObjectID = Schema.Types.ObjectId;

  const authOptionSchema = Schema({
    title: { type: String, unique: true, required: true },
    formPage: { type: String, required: true }
  });


  const groupSchema = Schema({
    courses: [{ type: ObjectID, ref: 'Course' }],
    name: { type: String, unique: true, required: true }
  });

  groupSchema.pre('remove', { document: true }, async function() {
    await this.populate('courses').execPopulate();

    await Promise.all(this.courses.map(course => course.remove()));

  });


  //This Schema is used to tie together documents associated with each login strategy.
  const userSchema = Schema({
    permissions: { type: String, required: true, enum: USER_PERMISSIONS, default: 'client' }, //Highest level from aliases is chosen
    groups: [{ group: { type: ObjectID, ref: 'Group', required: true }, permissions: { type: String, required: true, enum: GROUP_PERMISSIONS, default: 'visitor' } }],
    aliases: [{ type: ObjectID, ref: 'UserAlias', required: true }],
    student: { type: ObjectID, ref: 'Student' } // Reference to student object used for storing exam related information.
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
      Promise.all(this.groups.map(async ({ group, permissions }) => {
        return { group: await Group.findById(group), permissions: { name: permissions, level: GROUP_PERMISSIONS.indexOf(permissions) } };
      }));
  };

  userSchema.methods.getGroupPermissions = function(id) {

    if (this.userPermissions > 1)
      return { name: GROUP_PERMISSIONS[GROUP_PERMISSIONS.length - 1], level: GROUP_PERMISSIONS.length - 1 }

    const group = this.groups.find(g => g.group.toString() === id.toString());

    if (group) {
      const name = group.permissions;
      return { name, level: GROUP_PERMISSIONS.indexOf(name) };
    }

    return null;
  };

  userSchema.methods.hasGroupPermissions = function(groupId, permissionLevel) {
    const permissions = this.getGroupPermissions(groupId);

    return permissions && permissions.level >=  GROUP_PERMISSIONS.indexOf(permissionLevel);

  };

  userSchema.methods.updatePermissions = function(permissions) {
    if (USER_PERMISSIONS.indexOf(permissions) > USER_PERMISSIONS.indexOf(this.permissions)) {
      this.permissions = permissions
      return this.save();
    }
  };

  userSchema.methods.removeAlias = function(id) {
    this.aliases = this.aliases.filter(alias => alias.toString() !== id.toString());

    return (this.aliases.length) ? this.save() : this.remove();
  };



  //An alias corresponds to a login method. Each alias has to have at least these properties;
  const userAliasSchema = Schema({
    username: { type: String, unique: true }, //student id or some other unique identifier.
    parentUser: { type: ObjectID, ref: 'User', required: true },
    permissions: { type: String, required: true, enum: USER_PERMISSIONS, default: 'client' }
  });

  userAliasSchema.methods.getScreenName = function() {
    return this.username;
  };

  userAliasSchema.virtual('userPermissions').get(function () {
    return { name: this.permissions, level: USER_PERMISSIONS.indexOf(this.permissions) };
  });

  userAliasSchema.pre('save', { document: true }, async function() {
    await this.populate('parentUser').execPopulate();

    this.parentUser.updatePermissions(this.permissions);

  });

  userAliasSchema.pre('remove', { document: true }, async function() {
    await this.populate('parentUser').execPopulate();

    this.parentUser.removeAlias(this._id);

  });

  const localAliasSchema = Schema({
    passwordHash: String,
    passwordSalt: String,
    permissions: { type: String, default: 'admin', enum: ['admin'] }
  });

  const emailAliasSchema = Schema({
    passwordHash: String,
    passwordSalt: String,
    active: { type: Boolean, default: false, required: true }
  });

  //dummy alias for testing.
  const dummyAliasSchema = Schema({
    student: { type: ObjectID, ref: 'Student', required: true }
  });

  //Add desired eduPerson fields here.
  //Remember to add these fields to the parser as well.
  const hakaAliasSchema = Schema({
    email: { type: String, required: true },
    name: { type: String },
    student: { type: ObjectID, ref: 'Student' },
  });

  hakaAliasSchema.methods.getScreenName = function() {
    return `${ this.name } (${ this.username.split("@")[0] || "unactive" })`;
  };

  var AuthOption = conn.model('AuthOption', authOptionSchema);
  var Group = conn.model('Group', groupSchema);
  var User = conn.model('User', userSchema);
  var UserAlias = conn.model('UserAlias', userAliasSchema);
  var LocalAlias = UserAlias.discriminator('LocalAlias', localAliasSchema);
  var EmailAlias = UserAlias.discriminator('EmailAlias', emailAliasSchema);
  var DummyAlias = UserAlias.discriminator('DummyAlias', dummyAliasSchema);
  var HakaAlias = UserAlias.discriminator('HakaAlias', hakaAliasSchema);




  return { 
    User,
    Group,
    UserAlias,
    DummyAlias,
    LocalAlias,
    HakaAlias,
    AuthOption,
    EmailAlias
  };

};
  