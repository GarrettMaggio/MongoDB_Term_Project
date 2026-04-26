const DataContext = require('../../data/datacontext');

class StatsObserver {
  async update(eventName, payload) {
    if (eventName !== 'post:created') return;

    const topicStats = await DataContext.GetStats();
    let stat = topicStats.find((row) => row.topicId === payload.topicId);

    if (!stat) {
      stat = { topicId: payload.topicId, totalPosts: 0, lastPostAt: null };
      topicStats.push(stat);
    }

    stat.totalPosts += 1;
    stat.lastPostAt = payload.createdAt;
  }
}


module.exports = StatsObserver;
