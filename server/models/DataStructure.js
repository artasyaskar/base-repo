const mongoose = require('mongoose');

const dataStructureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['linear', 'non-linear', 'tree', 'graph', 'hash']
  },
  description: {
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
  operations: [{
    name: String,
    description: String,
    cCode: String,
    complexity: {
      time: String,
      space: String
    }
  }],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
dataStructureSchema.index({ name: 1, category: 1 });
dataStructureSchema.index({ tags: 1 });

module.exports = mongoose.model('DataStructure', dataStructureSchema);
