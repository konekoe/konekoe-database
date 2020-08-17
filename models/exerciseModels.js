const mongoose = require("mongoose");

module.exports = (conn) => {

  var Schema = mongoose.Schema;
  var ObjectID = Schema.Types.ObjectId;

  const exerciseVariantSchema = Schema({
    name: { type: String, required: true },
    path: { type: String, default: "" },
    description: { type: String },
    files: [{ type: ObjectID, ref: "File" }],
    paths: [{ type: String }]
  });

  const exerciseSchema = Schema({
    variants: [{ type: ObjectID, ref: "ExerciseVariant" }],
    points: { type: Number, default: 0 },
  });

  const examExerciseConfigSchema = Schema({
    exercises: [ { type: ObjectID, ref: "Exercise" } ],
  });

  const exerciseSubmissionSchema = Schema({
    points: { type: Number, required: true },
    submission: { type: String, required: true },
    output: { type: String }
  });

  const submissionMapSchema = Schema({
    variant: { type: ObjectID, ref: "ExerciseVariant", required: true },
    submissions: [{ type: ObjectID, ref: "ExerciseSubmission" }]
  });

  const studentExerciseResultSchema = Schema({
    student: { type: ObjectID, ref: "Student", required: true },
    exam: { type: ObjectID, ref: "Exam", required: true },
    exercises: [{
      exercise: { type: ObjectID, ref: "Exercise", required: true },
      variant: { type: ObjectID, ref: "ExerciseVariant", required: true }
    }],
    submissions: { type: [submissionMapSchema], default: [] } // List of Exercise => [Submission] pairs
  });

  const Exercise = conn.model("Exercise", exerciseSchema);
  const ExerciseVariant = conn.model("ExerciseVariant", exerciseVariantSchema);
  const ExamExerciseConfig = conn.model("ExamExerciseConfig", examExerciseConfigSchema);
  const ExerciseSubmission = conn.model("ExerciseSubmission", exerciseSubmissionSchema);
  const StudentExerciseResult = conn.model("StudentExerciseResult", studentExerciseResultSchema);
  
  return {
    Exercise,
    ExerciseVariant,
    ExamExerciseConfig,
    ExerciseSubmission,
    StudentExerciseResult
  };
};