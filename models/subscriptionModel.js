//const DatabaseSingleton = require('../config/databaseSingleton');
const DataContext = require('../data/datacontext');

class SubscriptionModel {
  getSubscriptions() {
    const subscriptions = DataContext.GetSubscriptions();
    return subscriptions;
  }

  listByUser(userId) {
    return this.getSubscriptions().filter((s) => s.userId === userId);
  }

  listTopicIdsByUser(userId) {
    return this.listByUser(userId).map((s) => s.topicId);
  }

  isSubscribed(userId, topicId) {
    return this.getSubscriptions().some((s) => s.userId === userId && s.topicId === topicId);
  }

  subscribe(userId, topicId) {
    const subscriptions = this.getSubscriptions();
    if (subscriptions.some((s) => s.userId === userId && s.topicId === topicId)) return false;
    subscriptions.push({ userId, topicId });
    return true;
  }

  unsubscribe(userId, topicId) {
    const subscriptions = this.getSubscriptions();
    const idx = subscriptions.findIndex((s) => s.userId === userId && s.topicId === topicId);
    if (idx === -1) return false;
    subscriptions.splice(idx, 1);
    return true;
  }
}

module.exports = new SubscriptionModel();
