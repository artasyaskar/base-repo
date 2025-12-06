const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String
  },
  progress: {
    completedDataStructures: [{
      dataStructureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DataStructure'
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: Number
    }],
    completedAlgorithms: [{
      algorithmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Algorithm'
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: Number
    }],
    totalPoints: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    codeEditorTheme: {
      type: String,
      default: 'monokai'
    },
    fontSize: {
      type: Number,
      default: 14,
      min: 10,
      max: 20
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate user level based on points
userSchema.methods.calculateLevel = function() {
  const points = this.progress.totalPoints;
  if (points >= 1000) return 5;
  if (points >= 500) return 4;
  if (points >= 250) return 3;
  if (points >= 100) return 2;
  return 1;
};

module.exports = mongoose.model('User', userSchema);
