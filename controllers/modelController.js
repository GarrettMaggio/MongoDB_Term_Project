const topicModel = require('../models/topicModel');

async function topicStatsApi(req, res) {
  const [topicStats, topics] = await Promise.all([topicModel.getStats(), topicModel.getAll()]);

  const data = topics.map((topic) => {
    const tracked = topicStats.find((row) => row.topicId?.toString() === topic.id && row.type === 'topic-posts') || { numPosts: 0, lastPostAt: null };
    return {
      ...topic,
      postCount: tracked.numPosts,
      lastPostAt: tracked.lastPostAt
    };
  });

  res.json({ topics: data });
}

module.exports = { topicStatsApi };
