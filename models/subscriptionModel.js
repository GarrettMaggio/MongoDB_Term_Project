//const DatabaseSingleton = require('../config/databaseSingleton');
const DataContext = require('../data/datacontext');

class SubscriptionModel {
  getSubscriptions() {
    const subscriptions = DataContext.GetSubscriptions();
    return subscriptions;
  }

  /*async listByUser(userId) {
    return await this.getSubscriptions().filter((s) => s.userId === userId);
  }*/

  async listTopicIdsByUser(userId) {
    const SubscriptionsById = await DataContext.FindSubscriptionsById(userId);
    return SubscriptionsById.map((s) => s.topicId);
  }

  async isSubscribed(userId, topicId) {
    return await this.getSubscriptions().some((s) => s.userId === userId && s.topicId === topicId);
  }

  async subscribe(userId, topicId) {
    const subscriptions = await this.getSubscriptions();
    if (subscriptions.some((s) => s.userId === userId && s.topicId === topicId)) return false;
    subscriptions.push({ userId, topicId });
    return true;
  }

  async unsubscribe(userId, topicId) {
    const subscriptions = await this.getSubscriptions();
    const idx = subscriptions.findIndex((s) => s.userId === userId && s.topicId === topicId);
    if (idx === -1) return false;
    subscriptions.splice(idx, 1);
    return true;
  }
}

module.exports = new SubscriptionModel();
