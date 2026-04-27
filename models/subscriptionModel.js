const DataContext = require('../data/datacontext');

class SubscriptionModel {
  normalizeId(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && typeof value.toHexString === 'function') {
      return value.toHexString();
    }
    if (typeof value === 'object' && typeof value.toString === 'function') {
      return value.toString();
    }
    return String(value);
  }

  async getSubscriptions() {
    const subscriptions = await DataContext.GetSubscriptions();
    return subscriptions;
  }

  async listByUser(userId) {
    return await DataContext.GetSubscriptionsByUserId(userId);
  }

  async getTopicIdsByUserId(userId) {
    const userSubs = await DataContext.GetSubscriptionsByUserId(userId);
    return userSubs.map((s) => this.normalizeId(s.topicId));
  }

  async listTopicIdsByUser(userId) {
    const subscriptionsById = await DataContext.FindSubscriptionsById(userId);
    return subscriptionsById.map((s) => this.normalizeId(s.topicId));
  }

  async isSubscribed(userId, topicId) {
    const found = await DataContext.FindSubscriptionsById(userId, topicId);
    return Array.isArray(found) && found.length > 0;
  }

  async subscribe(userId, topicId) {
    const existing = await DataContext.FindSubscriptionsById(userId, topicId);
    if (existing.length > 0) {
      return false;
    }
    await DataContext.CreateSubscription(userId, topicId);
    await DataContext.UpdateStats(userId, topicId);
    return true;
  }

  async unsubscribe(userId, topicId) {
    await DataContext.DeleteSubscription(userId, topicId);
    return true;
  }

  async countTotalAccesses() {
    const accessCounts = await DataContext.GetAccessCounts();
    return accessCounts;
  }

  async countTotalSubscriptions(userId) {
    const subscriptions = await DataContext.GetSubscriptionsByUserId(userId);
    return subscriptions.length;
  }
}

module.exports = new SubscriptionModel();
