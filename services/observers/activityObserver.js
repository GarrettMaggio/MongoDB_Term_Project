const DatabaseSingleton = require('../../config/databaseSingleton');

class ActivityObserver {
  update(eventName, payload) {
    const db = DatabaseSingleton.getInstance();
    const activityLog = db.getCollection('activityLog');
    activityLog.unshift({
      id: `a-${Date.now()}`,
      eventName,
      topicId: payload.topicId,
      userId: payload.userId,
      message: payload.content?.slice(0, 80) || '',
      createdAt: new Date().toISOString()
    });
  }
}

module.exports = ActivityObserver;
