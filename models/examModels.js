var mongoose = require("mongoose");

module.exports = (conn) => {

const { AuthOption } = require("./authModels.js")(conn);

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
  restrictedUrls: [{ type: String }],
  restrictionTypeUrl: { type: String, required: true, default: "none", enum: ["blacklist", "whitelist", "none"] },
  restrictedDomains: [{ type: String }],
  restrictionTypeDomain: { type: String, required: true, default: "none", enum: ["blacklist", "whitelist", "none"] },
  applicationOptions: [{ type: String }],
  files: [{ type: ObjectID, ref: "File" }],
  scrshInt: { type: Number, default: 0, min: 0 },
  examUrl: { type: String, required: true },
  examStart: { type: Date, required: true },
  examEnd: { type: Date, required: true }
});

//Handles removal of config documents.
//NOTE: THIS IS DOCUMENT MIDDLEWARE.
configSchema.pre("remove", { document: true }, async function(next) {
  await this.populate("files").execPopulate();

  for (const file of this.files) {
    await file.remove();
  }

  next();

});


var examSchema = Schema({
  examCode: { type: String, unique: true, required: true },
  course: { type: ObjectID, ref: "Course", required: true },
  authOptions: [{ type: String }],
  attendants: [{ type: ObjectID, ref: "Student" }],
  config: { type: ObjectID, ref: "Config", required: true },
  startDate: { type: Date, required: true},
  exercisePort: Number,
  wsPort: Number,
  httpPort: Number,
  ip: String,
  active: { type: Boolean, default: false },
  exerciseConfig: { type: ObjectID, ref: "ExamExerciseConfig" }
});

examSchema.methods.timeToStart = function() {
  return Date.parse(this.startDate) - Date.now();
}

examSchema.methods.getLoginOptions = async function() {
  try {
    return (await AuthOption.find({ title: { $in: this.authOptions } })).map(option => option.formPage);
  }
  catch (err) {
    throw err;
  }
}

//Handles removal of exam documents.
//NOTE: THIS IS DOCUMENT MIDDLEWARE.
examSchema.pre("remove", { document: true }, async function(next) {
  if (this.active)
    return Promise.reject(Error("Exam is active"))

  await this.populate("config").execPopulate();

  await this.config.remove();

  next();

});


var examFileSchema = Schema({
  file: { type: ObjectID, ref: "File", required: true },
  exam: { type: ObjectID, ref: "Exam", required: true }
});

var examUrlSchema = Schema({
  url: { type: String, required: true },
  exam: { type: ObjectID, ref: "Exam", required: true },
  timeStamp: { type: Date, default: Date.now }
});

var studentSchema = Schema({
  studentId: { type: String, unique: true, required: true },
  studentNumber: { type: String, default: "UNREGISTERED" },
  answers: [{type: ObjectID, ref: "ExamFile"}],
  syncs: [{type: ObjectID, ref: "ExamFile"}],
  screenshots: [{type: ObjectID, ref: "ExamFile"}],
  urls: [{type: ObjectID, ref: "ExamUrl"}]
});

var courseSchema = Schema({
  courseCode: {type: String, required: true, unique: true},
  exams: [{type: ObjectID, ref: "Exam"}]
});

//Handles removal of course documents.
//NOTE: THIS IS DOCUMENT MIDDLEWARE.
courseSchema.pre("remove", { document: true }, async function() {

  await this.populate("exams").execPopulate();

  await Exam.deleteMany({ $in: this.exams });
});
  
  var Student = conn.model("Student", studentSchema);
  var Course = conn.model("Course", courseSchema);
  var Exam = conn.model("Exam", examSchema);
  var ExamFile = conn.model("ExamFile", examFileSchema);
  var ExamUrl = conn.model("ExamUrl", examUrlSchema);
  var Config = conn.model("Config", configSchema);
  var File = conn.model("File", fileSchema);

  return {
    Student, 
    Course, 
    Exam, 
    ExamFile, 
    Config, 
    File, 
    ExamUrl
  }; 
};
