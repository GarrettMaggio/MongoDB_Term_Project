const DatabaseSingleton = require('../../config/databaseSingleton');

class ActivityObserver {
  async update(eventName, payload) {
    if (eventName !== 'post:created') return;

    const db = await DatabaseSingleton.getInstance();
    await db.collection('ActivityLog').insertOne({
      eventName,
      topicId: payload.topicId,
      userId: payload.userId,
      message: payload.content?.slice(0, 80) || '',
      createdAt: payload.createdAt || new Date().toISOString()
    });
  }
}

module.exports = ActivityObserver;
