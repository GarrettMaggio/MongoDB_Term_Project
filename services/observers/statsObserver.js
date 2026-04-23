const DatabaseSingleton = require('../../config/databaseSingleton');

class StatsObserver {
  async update(eventName, payload) {
    if (eventName !== 'post:created') return;

    const db = await DatabaseSingleton.getInstance();
    await db.collection('Stats').updateOne(
      { topicId: payload.topicId },
      {
        $inc: { totalPosts: 1 },
        $set: { lastPostAt: payload.createdAt || new Date().toISOString() }
      },
      { upsert: true }
    );
  }
}

module.exports = StatsObserver;
