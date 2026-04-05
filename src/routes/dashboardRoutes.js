const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireViewer, requireAnalyst } = require('../middleware/roles');
const { getSummary, getTrends } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authenticate);


// GET /api/dashboard/summary
router.get('/summary', requireViewer, getSummary); // All roles

// GET /api/dashboard/trends?months=6
router.get('/trends',requireAnalyst, getTrends); // Analyst + Admin Only

module.exports = router;