const mongoose = require('mongoose');

const algorithmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['sorting', 'searching', 'graph', 'dynamic-programming', 'greedy', 'divide-and-conquer', 'backtracking', 'string']
  },
  description: {
    type: String,
    required: true
  },
  problemStatement: {
    type: String,
    required: true
  },
  cCode: {
    type: String,
    required: true
  },
  headerCode: {
    type: String,
    required: true
  },
  complexity: {
    time: {
      best: String,
      average: String,
      worst: String
    },
    space: {
      best: String,
      average: String,
      worst: String
    }
  },
  approach: {
    type: String,
    required: true,
    enum: ['iterative', 'recursive', 'both']
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    description: String,
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  hints: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  tags: [String],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataStructure'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissions: {
    total: {
      type: Number,
      default: 0
    },
    successful: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
algorithmSchema.index({ name: 1, category: 1 });
algorithmSchema.index({ tags: 1 });
algorithmSchema.index({ difficulty: 1 });

// Calculate success rate
algorithmSchema.methods.getSuccessRate = function() {
  if (this.submissions.total === 0) return 0;
  return (this.submissions.successful / this.submissions.total) * 100;
};

module.exports = mongoose.model('Algorithm', algorithmSchema);
