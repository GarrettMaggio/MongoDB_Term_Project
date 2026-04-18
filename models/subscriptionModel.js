const DatabaseSingleton = require('../config/databaseSingleton');

class SubscriptionModel {
  constructor() {
    this.db = DatabaseSingleton.getInstance();
  }

  listByUser(userId) {
    return this.db.getCollection('subscriptions').filter((s) => s.userId === userId);
  }

  listTopicIdsByUser(userId) {
    return this.listByUser(userId).map((s) => s.topicId);
  }

  isSubscribed(userId, topicId) {
    return this.db.getCollection('subscriptions').some((s) => s.userId === userId && s.topicId === topicId);
  }

  subscribe(userId, topicId) {
    const subscriptions = this.db.getCollection('subscriptions');
    if (subscriptions.some((s) => s.userId === userId && s.topicId === topicId)) return false;
    subscriptions.push({ userId, topicId });
    return true;
  }

  unsubscribe(userId, topicId) {
    const subscriptions = this.db.getCollection('subscriptions');
    const idx = subscriptions.findIndex((s) => s.userId === userId && s.topicId === topicId);
    if (idx === -1) return false;
    subscriptions.splice(idx, 1);
    return true;
  }
}

module.exports = new SubscriptionModel();
