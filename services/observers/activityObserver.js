//const DatabaseSingleton = require('../../config/databaseSingleton');
const DataContext = require('../../data/datacontext');

class ActivityObserver {
  
  async update(eventName, payload) {
    if (eventName !== 'post:created') return;
    await DataContext.CreateActivityLog(payload.userId, 'post:created', payload.topicId);
  }
}

module.exports = ActivityObserver;
