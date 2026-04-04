const prisma = require('../config/database');

// Get dashboard summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user's records
    const records = await prisma.record.findMany({
      where: { userId }
    });

    // Calculate totals
    const totalIncome = records
      .filter(r => r.type === 'INCOME')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const totalExpenses = records
      .filter(r => r.type === 'EXPENSE')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const netBalance = totalIncome - totalExpenses;

    // Category-wise totals
    const categoryTotals = {};
    records.forEach(r => {
      if (!categoryTotals[r.category]) {
        categoryTotals[r.category] = { INCOME: 0, EXPENSE: 0 };
      }
      categoryTotals[r.category][r.type] += parseFloat(r.amount);
    });

    // Recent activity (last 5 records)
    const recentActivity = await prisma.record.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
        totalRecords: records.length
      },
      categoryTotals,
      recentActivity
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get monthly trends
const getTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const records = await prisma.record.findMany({
      where: {
        userId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    // Group by month
    const monthlyData = {};
    records.forEach(r => {
      const monthKey = r.date.toISOString().slice(0, 7); // "2026-04"
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { INCOME: 0, EXPENSE: 0 };
      }
      monthlyData[monthKey][r.type] += parseFloat(r.amount);
    });

    // Convert to array format
    const trends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.INCOME,
      expenses: data.EXPENSE,
      balance: data.INCOME - data.EXPENSE
    }));

    res.json({ trends, period: `${months} months` });

  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getSummary, getTrends };