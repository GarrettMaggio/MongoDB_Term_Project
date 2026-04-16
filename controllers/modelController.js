const topicModel = require('../models/topicModel');
const db = require('../config/databaseSingleton').getInstance();

function topicStatsApi(req, res) {
  const topicStats = db.getCollection('topicStats');
  const data = topicModel.getAll().map((topic) => {
    const tracked = topicStats.find((row) => row.topicId === topic.id) || { totalPosts: 0, lastPostAt: null };
    return {
      ...topic,
      postCount: tracked.totalPosts,
      lastPostAt: tracked.lastPostAt
    };
  });

  res.json({ topics: data });
}

module.exports = { topicStatsApi };
