const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    mentor: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Review', 'Completed'],
      default: 'Planning'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    budget: {
      type: Number,
      min: 0,
      default: 0
    },
    dueDate: {
      type: Date,
      required: true
    },
    tags: {
      type: [String],
      default: []
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({
  title: 'text',
  studentName: 'text',
  rollNumber: 'text',
  department: 'text',
  mentor: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Project', projectSchema);
