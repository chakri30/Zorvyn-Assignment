const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireViewer } = require('../middleware/roles');
const { getSummary, getTrends } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authenticate);
router.use(requireViewer); // All roles can view dashboard

// GET /api/dashboard/summary
router.get('/summary', getSummary);

// GET /api/dashboard/trends?months=6
router.get('/trends', getTrends);

module.exports = router;