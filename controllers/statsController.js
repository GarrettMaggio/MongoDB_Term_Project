const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const db = require('../config/databaseSingleton').getInstance();
const { statsView } = require('../views/pages');

async function statsPage(req, res) {
  const user = await userModel.findById(req.session.userId); 
  const topicStats = await topicModel.getTopicStats();
  const strawStats = await topicModel.getStats();
  const stats = strawStats.map((topic) => {
    const tracked = topicStats.find((row) => row.topicId === topic.id) || { totalPosts: 0, lastPostAt: null };
    return {
      id: topic.id,
      name: topic.name,
      tags: topic.tags,
      accessCount: topic.accessCount,
      totalPosts: tracked.totalPosts,
      lastPostAt: tracked.lastPostAt
    };
  }).sort((a, b) => b.accessCount - a.accessCount);

  res.html(statsView({ user, stats }));
}

module.exports = { statsPage };
