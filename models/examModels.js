var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectID = Schema.Types.ObjectId;

var fileSchema = Schema({
    filename: {type: String, required: true},
    data: Buffer,
    flags: Number
});


var configSchema = Schema({
  courseCode: String,
  examCode: String,
  blacklist: [{type: String}],
  whitelist: [{type: String}],
  files: [{type: ObjectID, ref: 'File'}],
  scrshInt: {type: Number, default: 0, min: 0},
  examUrl: { type: String, required: true },
  examStart: { type: Date, required: true },
  examEnd: { type: Date, required: true }
});

//Handles removal of config documents.
//NOTE: THIS IS DOCUMENT MIDDLEWARE.
configSchema.pre('remove', { document: true }, async function(next) {
  await this.populate('files').execPopulate();

  for (const file of this.files) {
    await file.remove();
  }

  next();

});


var examSchema = Schema({
  examCode: { type: String, unique: true, required: true },
  courseCode: String,
  authOptions: [{type: String}],
  attendants: [{type: ObjectID, ref: 'Student'}],
  config: { type: ObjectID, ref: 'Config', required: true },
  startDate: { type: Date, required: true},
  wsPort: Number,
  httpPort: Number,
  ip: String,
  active: { type: Boolean, default: false }
});

examSchema.methods.timeToStart = function() {
  return Date.parse(this.startDate) - Date.now();
}

//Handles removal of exam documents.
//NOTE: THIS IS DOCUMENT MIDDLEWARE.
examSchema.pre('remove', { document: true }, async function(next) {
  await this.populate('config').execPopulate();

  await this.config.remove();

  next();

});


var examFileSchema = Schema({
  file: { type: ObjectID, ref: 'File', required: true },
  exam: { type: ObjectID, ref: 'Exam', required: true }
});

var studentSchema = Schema({
  studentId: { type: String, unique: true, required: true },
  answers: [{type: ObjectID, ref: 'ExamFile'}],
  syncs: [{type: ObjectID, ref: 'ExamFile'}],
  screenshots: [{type: ObjectID, ref: 'ExamFile'}]
});

var courseSchema = Schema({
  courseCode: {type: String, required: true, unique: true},
  exams: [{type: ObjectID, ref: 'Exam'}]
});

//Handles removal of course documents.
//NOTE: THIS IS DOCUMENT MIDDLEWARE.
courseSchema.pre('remove', { document: true }, async function(next) {

  await this.populate('exams').execPopulate();

  for (const exam of this.exams) {
    await exam.remove();
  }

  next();

});

var Student = mongoose.model('Student', studentSchema);
var Course = mongoose.model('Course', courseSchema);
var Exam = mongoose.model('Exam', examSchema);
var ExamFile = mongoose.model('ExamFile', examFileSchema);
var Config = mongoose.model('Config', configSchema);
var File = mongoose.model('File', fileSchema);


module.exports = {Student, Course, Exam, ExamFile, Config, File};
