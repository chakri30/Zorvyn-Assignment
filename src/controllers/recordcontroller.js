const prisma = require('../config/database');

// Create record (Admin only)
const createRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || !type || !category || !date) {
      return res.status(400).json({ 
        error: 'Amount, type, category, and date are required' 
      });
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ error: 'Type must be INCOME or EXPENSE' });
    }

    const record = await prisma.record.create({
      data: {
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date),
        notes: notes || null,
        userId
      }
    });

    res.status(201).json({
      message: 'Record created successfully',
      record
    });

  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all records (with pagination, filtering, search)
const getRecords = async (req, res) => {
  try {
    const { 
      type, 
      category, 
      startDate, 
      endDate, 
      search,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const userId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { 
      userId,
      isDeleted: false  // Only show non-deleted records
    };

    if (type) where.type = type;
    if (category) where.category = { contains: category, mode: 'insensitive' };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Search in notes or category
    if (search) {
      where.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.record.count({ where });

    // Get paginated records
    const records = await prisma.record.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / take);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      records,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: take,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single record (only non-deleted)
const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const record = await prisma.record.findFirst({
      where: { 
        id: parseInt(id), 
        userId,
        isDeleted: false  // Only show non-deleted
      }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ record });

  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update record (Admin only) - can only update non-deleted
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    const existing = await prisma.record.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false  // Only update non-deleted
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const updated = await prisma.record.update({
      where: { id: parseInt(id) },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        type: type || undefined,
        category: category || undefined,
        date: date ? new Date(date) : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });

    res.json({
      message: 'Record updated successfully',
      record: updated
    });

  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Soft delete record (Admin only)
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.record.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false  // Only delete if not already deleted
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Soft delete instead of hard delete
    await prisma.record.update({
      where: { id: parseInt(id) },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    res.json({ message: 'Record deleted successfully (soft delete)' });

  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord
};