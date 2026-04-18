const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const db = require('../config/databaseSingleton').getInstance();
const { statsView } = require('../views/pages');

function statsPage(req, res) {
  const user = userModel.findById(req.session.userId);
  const topicStats = db.getCollection('topicStats');
  const stats = topicModel.getAll().map((topic) => {
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
