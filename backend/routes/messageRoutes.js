const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new message
router.post('/', async (req, res) => {
  console.log('Received POST request:', req.body); // Debug log
  
  const { text, user } = req.body;
  
  // Validation
  if (!text || !user) {
    return res.status(400).json({ 
      message: 'Both text and user fields are required' 
    });
  }

  if (text.trim().length === 0 || user.trim().length === 0) {
    return res.status(400).json({ 
      message: 'Text and user cannot be empty' 
    });
  }

  const message = new Message({
    text: text.trim(),
    user: user.trim()
  });

  try {
    const newMessage = await message.save();
    console.log('Message saved:', newMessage); // Debug log
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error saving message:', err); // Debug log
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
