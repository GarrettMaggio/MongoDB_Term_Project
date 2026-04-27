const DataContext = require('../../data/datacontext');

class StatsObserver {
  async update(eventName, payload) {
    if (eventName !== 'post:created') return;
    await DataContext.IncrementTopicPostStats(payload.topicId, payload.createdAt);
  }
}


module.exports = StatsObserver;
