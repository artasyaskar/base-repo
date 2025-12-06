const express = require('express');
const DataStructure = require('../models/DataStructure');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all data structures
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

    const dataStructures = await DataStructure.find(filter)
      .populate('createdBy', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await DataStructure.countDocuments(filter);

    res.json({
      dataStructures,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching data structures:', error);
    res.status(500).json({ error: 'Server error fetching data structures.' });
  }
});

// Get data structure by ID
router.get('/:id', async (req, res) => {
  try {
    const dataStructure = await DataStructure.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!dataStructure) {
      return res.status(404).json({ error: 'Data structure not found.' });
    }

    res.json(dataStructure);
  } catch (error) {
    console.error('Error fetching data structure:', error);
    res.status(500).json({ error: 'Server error fetching data structure.' });
  }
});

// Create new data structure (instructors and admins only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Only instructors and admins can create data structures.' });
    }

    const {
      name,
      category,
      description,
      cCode,
      headerCode,
      complexity,
      operations,
      examples,
      difficulty,
      tags
    } = req.body;

    // Validate required fields
    if (!name || !category || !description || !cCode || !headerCode) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const dataStructure = new DataStructure({
      name,
      category,
      description,
      cCode,
      headerCode,
      complexity,
      operations,
      examples,
      difficulty,
      tags,
      createdBy: req.user._id
    });

    await dataStructure.save();
    await dataStructure.populate('createdBy', 'username');

    res.status(201).json({
      message: 'Data structure created successfully.',
      dataStructure
    });
  } catch (error) {
    console.error('Error creating data structure:', error);
    res.status(500).json({ error: 'Server error creating data structure.' });
  }
});

// Update data structure (creator, instructors, and admins only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const dataStructure = await DataStructure.findById(req.params.id);
    
    if (!dataStructure) {
      return res.status(404).json({ error: 'Data structure not found.' });
    }

    // Check permissions
    if (req.user.role === 'student' && dataStructure.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only update your own data structures.' });
    }

    const updates = req.body;
    Object.assign(dataStructure, updates);
    
    await dataStructure.save();
    await dataStructure.populate('createdBy', 'username');

    res.json({
      message: 'Data structure updated successfully.',
      dataStructure
    });
  } catch (error) {
    console.error('Error updating data structure:', error);
    res.status(500).json({ error: 'Server error updating data structure.' });
  }
});

// Delete data structure (creator, instructors, and admins only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const dataStructure = await DataStructure.findById(req.params.id);
    
    if (!dataStructure) {
      return res.status(404).json({ error: 'Data structure not found.' });
    }

    // Check permissions
    if (req.user.role === 'student' && dataStructure.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own data structures.' });
    }

    await DataStructure.findByIdAndDelete(req.params.id);

    res.json({ message: 'Data structure deleted successfully.' });
  } catch (error) {
    console.error('Error deleting data structure:', error);
    res.status(500).json({ error: 'Server error deleting data structure.' });
  }
});

// Get data structures by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const dataStructures = await DataStructure.find({ category })
      .populate('createdBy', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await DataStructure.countDocuments({ category });

    res.json({
      dataStructures,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching data structures by category:', error);
    res.status(500).json({ error: 'Server error fetching data structures by category.' });
  }
});

module.exports = router;
