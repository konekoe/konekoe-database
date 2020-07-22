const mongoose = require("mongoose");

module.exports = (conn) => {

  var Schema = mongoose.Schema;
  var ObjectID = Schema.Types.ObjectId;

  const exerciseSchema = Schema({
    content: { type: String, required: true },
    points: { type: Number, default: 0 },
  });

  const examExerciseConfigSchema = Schema({
    exercises: [ { type: ObjectID, ref: "Exercise" } ],
    useAll: { type: Boolean, default: true, required: true },
    numPerInstance: Number
  });

  const exerciseSubmissionSchema = Schema({
    points: { type: Number, required: true },
    submission: { type: String, required: true },
    output: { type: String }
  });

  const submissionMapSchema = Schema({
    exercise: { type: ObjectID, ref: "Exercise", required: true },
    submissions: [{ type: ObjectID, ref: "ExerciseSubmission" }]
  });

  const studentExerciseResultSchema = Schema({
    student: { type: ObjectID, ref: "Student", required: true },
    exam: { type: ObjectID, ref: "Student" },
    submissions: [submissionMapSchema] // List of Exercise => [Submission] pairs
  });

  const Exercise = conn.model("Exercise", exerciseSchema);
  const ExamExerciseConfig = conn.model("ExamExerciseConfig", examExerciseConfigSchema);
  const ExerciseSubmission = conn.model("ExerciseSubmission", exerciseSubmissionSchema);
  const StudentExerciseResult = conn.model("StudentExerciseResult", studentExerciseResultSchema);
  
  return {
    Exercise,
    ExamExerciseConfig,
    ExerciseSubmission,
    StudentExerciseResult
  };
};