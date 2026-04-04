const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireViewer } = require('../middleware/roles');
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord
} = require('../controllers/recordController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Viewer, Analyst, Admin can view records
router.get('/', requireViewer, getRecords);
router.get('/:id', requireViewer, getRecordById);

// Only Admin can create, update, delete
router.post('/', requireAdmin, createRecord);
router.put('/:id', requireAdmin, updateRecord);
router.delete('/:id', requireAdmin, deleteRecord);

module.exports = router;