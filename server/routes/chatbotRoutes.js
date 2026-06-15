const express = require('express');
const { handleChatQuery } = require('../controllers/chatbotController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/query', optionalAuth, handleChatQuery);

module.exports = router;
