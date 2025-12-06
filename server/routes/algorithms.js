const express = require('express');
const Algorithm = require('../models/Algorithm');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get all algorithms
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const algorithms = await Algorithm.find(filter)
      .populate('createdBy', 'username')
      .populate('prerequisites', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Algorithm.countDocuments(filter);

    res.json({
      algorithms,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching algorithms:', error);
    res.status(500).json({ error: 'Server error fetching algorithms.' });
  }
});

// Get algorithm by ID
router.get('/:id', async (req, res) => {
  try {
    const algorithm = await Algorithm.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('prerequisites', 'name category');
    
    if (!algorithm) {
      return res.status(404).json({ error: 'Algorithm not found.' });
    }

    // Add success rate to response
    const algorithmObj = algorithm.toObject();
    algorithmObj.successRate = algorithm.getSuccessRate();

    res.json(algorithmObj);
  } catch (error) {
    console.error('Error fetching algorithm:', error);
    res.status(500).json({ error: 'Server error fetching algorithm.' });
  }
});

// Create new algorithm (instructors and admins only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Only instructors and admins can create algorithms.' });
    }

    const {
      name,
      category,
      description,
      problemStatement,
      cCode,
      headerCode,
      complexity,
      approach,
      testCases,
      examples,
      constraints,
      hints,
      difficulty,
      tags,
      prerequisites
    } = req.body;

    // Validate required fields
    if (!name || !category || !description || !problemStatement || !cCode || !headerCode) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const algorithm = new Algorithm({
      name,
      category,
      description,
      problemStatement,
      cCode,
      headerCode,
      complexity,
      approach,
      testCases,
      examples,
      constraints,
      hints,
      difficulty,
      tags,
      prerequisites,
      createdBy: req.user._id
    });

    await algorithm.save();
    await algorithm.populate('createdBy', 'username');
    await algorithm.populate('prerequisites', 'name');

    res.status(201).json({
      message: 'Algorithm created successfully.',
      algorithm
    });
  } catch (error) {
    console.error('Error creating algorithm:', error);
    res.status(500).json({ error: 'Server error creating algorithm.' });
  }
});

// Update algorithm (creator, instructors, and admins only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const algorithm = await Algorithm.findById(req.params.id);
    
    if (!algorithm) {
      return res.status(404).json({ error: 'Algorithm not found.' });
    }

    // Check permissions
    if (req.user.role === 'student' && algorithm.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only update your own algorithms.' });
    }

    const updates = req.body;
    Object.assign(algorithm, updates);
    
    await algorithm.save();
    await algorithm.populate('createdBy', 'username');
    await algorithm.populate('prerequisites', 'name');

    res.json({
      message: 'Algorithm updated successfully.',
      algorithm
    });
  } catch (error) {
    console.error('Error updating algorithm:', error);
    res.status(500).json({ error: 'Server error updating algorithm.' });
  }
});

// Delete algorithm (creator, instructors, and admins only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const algorithm = await Algorithm.findById(req.params.id);
    
    if (!algorithm) {
      return res.status(404).json({ error: 'Algorithm not found.' });
    }

    // Check permissions
    if (req.user.role === 'student' && algorithm.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own algorithms.' });
    }

    await Algorithm.findByIdAndDelete(req.params.id);

    res.json({ message: 'Algorithm deleted successfully.' });
  } catch (error) {
    console.error('Error deleting algorithm:', error);
    res.status(500).json({ error: 'Server error deleting algorithm.' });
  }
});

// Submit solution for algorithm
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { code, language = 'c' } = req.body;
    const algorithm = await Algorithm.findById(req.params.id);

    if (!algorithm) {
      return res.status(404).json({ error: 'Algorithm not found.' });
    }

    // Update submission statistics
    algorithm.submissions.total += 1;
    
    // Here you would typically compile and run the code against test cases
    // For now, we'll simulate a basic validation
    const isValid = code && code.includes('main') && code.length > 50;
    
    if (isValid) {
      algorithm.submissions.successful += 1;
    }

    await algorithm.save();

    // Update user progress
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    const existingCompletion = user.progress.completedAlgorithms.find(
      comp => comp.algorithmId.toString() === req.params.id
    );

    if (!existingCompletion && isValid) {
      user.progress.completedAlgorithms.push({
        algorithmId: req.params.id,
        score: isValid ? 100 : 0
      });
      user.progress.totalPoints += 10;
      user.progress.level = user.calculateLevel();
      await user.save();
    }

    res.json({
      success: isValid,
      message: isValid ? 'Solution accepted!' : 'Solution failed. Please try again.',
      score: isValid ? 100 : 0,
      totalSubmissions: algorithm.submissions.total,
      successRate: algorithm.getSuccessRate()
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ error: 'Server error submitting solution.' });
  }
});

// Get algorithms by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const algorithms = await Algorithm.find({ category })
      .populate('createdBy', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Algorithm.countDocuments({ category });

    res.json({
      algorithms,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching algorithms by category:', error);
    res.status(500).json({ error: 'Server error fetching algorithms by category.' });
  }
});

module.exports = router;
