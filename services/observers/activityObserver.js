//const DatabaseSingleton = require('../../config/databaseSingleton');
const DataContext = require('../../data/datacontext');

class ActivityObserver {
  
  async update(eventName, payload) {
    const activityLog = await DataContext.GetActivityLog();
    activityLog.unshift({
      id: `a-${Date.now()}`,
      eventName,
      topicId: payload.topicId,
      userId: payload.userId,
      message: payload.content?.slice(0, 80) || '',
      createdAt: payload.createdAt || new Date().toISOString()
    });
  }
}

module.exports = ActivityObserver;
