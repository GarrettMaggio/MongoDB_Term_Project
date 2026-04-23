const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const DatabaseSingleton = require('../config/databaseSingleton');
const { statsView } = require('../views/pages');

async function statsPage(req, res) {
  const user = await userModel.findById(req.session.userId);
  const db = await DatabaseSingleton.getInstance();
  const [topics, topicStats] = await Promise.all([
    topicModel.getAll(),
    db.collection('Stats').find({}).toArray()
  ]);

  const stats = topics.map((topic) => {
    const tracked = topicStats.find((row) => row.topicId === topic.id) || { totalPosts: 0, lastPostAt: null };
    return {
      id: topic.id,
      name: topic.name,
      tags: topic.tags,
      accessCount: topic.accessCount,
      totalPosts: tracked.totalPosts,
      lastPostAt: tracked.lastPostAt
    };
  }).sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));

  res.html(statsView({ user, stats }));
}

module.exports = { statsPage };
