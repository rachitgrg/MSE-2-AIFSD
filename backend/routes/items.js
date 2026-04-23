const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');

// All routes are protected by authMiddleware
router.use(authMiddleware);

// POST /api/items - Add a new item
router.post('/', async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    // Validate input
    if (!itemName || !description || !type || !location || !contactInfo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['Lost', 'Found'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either Lost or Found' });
    }

    const item = new Item({
      itemName,
      description,
      type,
      location,
      date: date || Date.now(),
      contactInfo,
      reportedBy: req.user.id
    });

    await item.save();
    await item.populate('reportedBy', 'name email');

    res.status(201).json({ message: 'Item reported successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/items - View all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ items, count: items.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/items/search?name=xyz - Search items by name or category
router.get('/search', async (req, res) => {
  try {
    const { name, category } = req.query;

    let query = {};

    if (name) {
      query.$or = [
        { itemName: { $regex: name, $options: 'i' } },
        { description: { $regex: name, $options: 'i' } },
        { location: { $regex: name, $options: 'i' } }
      ];
    }

    if (category && ['Lost', 'Found'].includes(category)) {
      query.type = category;
    }

    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ items, count: items.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/items/:id - View item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ item });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the logged-in user is the owner
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You can only update your own items' });
    }

    const { itemName, description, type, location, date, contactInfo } = req.body;

    if (type && !['Lost', 'Found'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either Lost or Found' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { itemName, description, type, location, date, contactInfo },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');

    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the logged-in user is the owner
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own items' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
