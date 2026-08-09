import mongoose, { Document, Schema } from 'mongoose';

export type ExerciseType = 'multiple-choice' | 'listening' | 'reading';

export interface IExercise {
  _id?: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswers: (string | number)[];
  audioPrompt?: string;
  explanation?: string;
}

export interface IAudioContent {
  text: string;
  type: 'word' | 'phrase' | 'sentence';
  context?: string;
}

export interface ILessonContent {
  introduction: string;
  objectives: string[];
  mainContent: string;
  summary: string;
}

export interface ILesson extends Document {
  levelId: number;
  lessonNumber: number;
  title: string;
  description: string;
  content: ILessonContent;
  exercises: IExercise[];
  audioContent?: IAudioContent[];
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>(
  {
    type: {
      type: String,
      enum: ['multiple-choice', 'listening', 'reading'],
      required: [true, 'Exercise type is required'],
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      minlength: [5, 'Question must be at least 5 characters long'],
    },
    options: {
      type: [String],
      validate: {
        validator: function (this: IExercise) {
          // Multiple choice questions must have options
          if (this.type === 'multiple-choice') {
            return this.options && this.options.length >= 2 && this.options.length <= 5;
          }
          return true;
        },
        message: 'Multiple-choice questions must have 2-5 options',
      },
    },
    correctAnswers: {
      type: [Schema.Types.Mixed],
      required: [true, 'Correct answers are required'],
      validate: {
        validator: function (v: (string | number)[]) {
          return v && v.length >= 1;
        },
        message: 'At least one correct answer must be provided',
      },
    },
    audioPrompt: {
      type: String,
      validate: {
        validator: function (this: IExercise) {
          // Listening exercises should have audio prompt
          if (this.type === 'listening') {
            return !!this.audioPrompt;
          }
          return true;
        },
        message: 'Listening exercises must have an audio prompt',
      },
    },
    explanation: {
      type: String,
      maxlength: [500, 'Explanation must not exceed 500 characters'],
    },
  },
  { _id: true }
);

const audioContentSchema = new Schema<IAudioContent>(
  {
    text: {
      type: String,
      required: [true, 'Audio text is required'],
      minlength: [1, 'Audio text must not be empty'],
    },
    type: {
      type: String,
      enum: ['word', 'phrase', 'sentence'],
      required: [true, 'Audio type is required'],
    },
    context: {
      type: String,
      maxlength: [200, 'Context must not exceed 200 characters'],
    },
  },
  { _id: false }
);

const lessonContentSchema = new Schema<ILessonContent>(
  {
    introduction: {
      type: String,
      required: [true, 'Introduction is required'],
      minlength: [10, 'Introduction must be at least 10 characters long'],
    },
    objectives: {
      type: [String],
      required: [true, 'Objectives are required'],
      validate: {
        validator: function (v: string[]) {
          return v.length >= 1 && v.length <= 5;
        },
        message: 'Lesson must have 1-5 objectives',
      },
    },
    mainContent: {
      type: String,
      required: [true, 'Main content is required'],
      minlength: [50, 'Main content must be at least 50 characters long'],
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      minlength: [20, 'Summary must be at least 20 characters long'],
    },
  },
  { _id: false }
);

const lessonSchema = new Schema<ILesson>(
  {
    levelId: {
      type: Number,
      required: [true, 'Level ID is required'],
      min: [1, 'Level ID must be at least 1'],
      max: [10, 'Level ID must not exceed 10'],
      index: true,
    },
    lessonNumber: {
      type: Number,
      required: [true, 'Lesson number is required'],
      min: [1, 'Lesson number must be at least 1'],
      max: [10, 'Lesson number must not exceed 10'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    content: {
      type: lessonContentSchema,
      required: [true, 'Lesson content is required'],
    },
    exercises: {
      type: [exerciseSchema],
      required: [true, 'Exercises are required'],
      validate: {
        validator: function (v: IExercise[]) {
          return v.length >= 3 && v.length <= 20;
        },
        message: 'Lesson must have 3-20 exercises',
      },
    },
    audioContent: {
      type: [audioContentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'lessons',
  }
);

// Create composite unique index on levelId and lessonNumber
lessonSchema.index({ levelId: 1, lessonNumber: 1 }, { unique: true });
lessonSchema.index({ levelId: 1 });

// Pre-save validation to ensure consistency
lessonSchema.pre('save', function (next) {
  // Validate that options are unique for multiple choice questions
  this.exercises.forEach((exercise) => {
    if (exercise.type === 'multiple-choice' && exercise.options) {
      const uniqueOptions = new Set(exercise.options);
      if (uniqueOptions.size !== exercise.options.length) {
        throw new Error('Multiple choice options must be unique');
      }
      // Validate that correctAnswers are valid indices
      exercise.correctAnswers.forEach((answer) => {
        if (typeof answer === 'number' && (answer < 0 || answer >= exercise.options!.length)) {
          throw new Error(`Correct answer index ${answer} is out of bounds for options`);
        }
      });
    }
  });
  next();
});

// Create and export model
const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;
