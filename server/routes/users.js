const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all users (admins only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const { page = 1, limit = 10, search, role } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error fetching users.' });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('progress.completedDataStructures.dataStructureId', 'name')
      .populate('progress.completedAlgorithms.algorithmId', 'name');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Only allow users to view their own profile or admins to view any profile
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error fetching user.' });
  }
});

// Update user role (admins only)
router.put('/:id/role', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const { role } = req.body;
    
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error updating user role.' });
  }
});

// Deactivate/activate user (admins only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent admins from deactivating themselves
    if (req.user._id.toString() === req.params.id && !isActive) {
      return res.status(400).json({ error: 'Cannot deactivate your own account.' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Server error updating user status.' });
  }
});

// Get user progress statistics
router.get('/:id/progress', authMiddleware, async (req, res) => {
  try {
    // Only allow users to view their own progress or admins to view any progress
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const user = await User.findById(req.params.id)
      .populate('progress.completedDataStructures.dataStructureId', 'name category difficulty')
      .populate('progress.completedAlgorithms.algorithmId', 'name category difficulty');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const progress = {
      totalPoints: user.progress.totalPoints,
      level: user.progress.level,
      completedDataStructures: user.progress.completedDataStructures.length,
      completedAlgorithms: user.progress.completedAlgorithms.length,
      dataStructuresByCategory: {},
      algorithmsByCategory: {},
      recentActivity: [
        ...user.progress.completedDataStructures.map(ds => ({
          type: 'datastructure',
          name: ds.dataStructureId.name,
          category: ds.dataStructureId.category,
          difficulty: ds.dataStructureId.difficulty,
          completedAt: ds.completedAt,
          score: ds.score
        })),
        ...user.progress.completedAlgorithms.map(algo => ({
          type: 'algorithm',
          name: algo.algorithmId.name,
          category: algo.algorithmId.category,
          difficulty: algo.algorithmId.difficulty,
          completedAt: algo.completedAt,
          score: algo.score
        }))
      ].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 10)
    };

    // Group by categories
    user.progress.completedDataStructures.forEach(ds => {
      const category = ds.dataStructureId.category;
      progress.dataStructuresByCategory[category] = (progress.dataStructuresByCategory[category] || 0) + 1;
    });

    user.progress.completedAlgorithms.forEach(algo => {
      const category = algo.algorithmId.category;
      progress.algorithmsByCategory[category] = (progress.algorithmsByCategory[category] || 0) + 1;
    });

    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Server error fetching user progress.' });
  }
});

// Update user progress (internal use)
router.post('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { type, itemId, score } = req.body;
    
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (type === 'datastructure') {
      const existingIndex = user.progress.completedDataStructures.findIndex(
        ds => ds.dataStructureId.toString() === itemId
      );

      if (existingIndex === -1) {
        user.progress.completedDataStructures.push({
          dataStructureId: itemId,
          score: score || 100,
          completedAt: new Date()
        });
        user.progress.totalPoints += 10;
      } else {
        user.progress.completedDataStructures[existingIndex].score = Math.max(
          user.progress.completedDataStructures[existingIndex].score,
          score || 100
        );
      }
    } else if (type === 'algorithm') {
      const existingIndex = user.progress.completedAlgorithms.findIndex(
        algo => algo.algorithmId.toString() === itemId
      );

      if (existingIndex === -1) {
        user.progress.completedAlgorithms.push({
          algorithmId: itemId,
          score: score || 100,
          completedAt: new Date()
        });
        user.progress.totalPoints += 15;
      } else {
        user.progress.completedAlgorithms[existingIndex].score = Math.max(
          user.progress.completedAlgorithms[existingIndex].score,
          score || 100
        );
      }
    }

    user.progress.level = user.calculateLevel();
    await user.save();

    res.json({
      message: 'Progress updated successfully.',
      totalPoints: user.progress.totalPoints,
      level: user.progress.level
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ error: 'Server error updating user progress.' });
  }
});

module.exports = router;
