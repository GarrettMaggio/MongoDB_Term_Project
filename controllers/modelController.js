const topicModel = require('../models/topicModel');
const DatabaseSingleton = require('../config/databaseSingleton');

async function topicStatsApi(req, res) {
  const db = await DatabaseSingleton.getInstance();
  const [topicStats, topics] = await Promise.all([
    db.collection('Stats').find({}).toArray(),
    topicModel.getAll()
  ]);

  const data = topics.map((topic) => {
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
