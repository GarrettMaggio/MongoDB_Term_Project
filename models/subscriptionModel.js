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

  /*async listByUser(userId) {
    return await this.getSubscriptions().filter((s) => s.userId === userId);
  }*/

  async getTopicIdsByUserId(userId) {
    const allSubs = await DataContext.GetSubscriptions();
    const normalizedUserId = this.normalizeId(userId);
    return allSubs
      .filter((s) => this.normalizeId(s.userId) === normalizedUserId)
      .map((s) => this.normalizeId(s.topicId));
  }

  async listTopicIdsByUser(userId) {
    const subscriptionsById = await DataContext.FindSubscriptionsById(userId);
    return subscriptionsById.map((s) => this.normalizeId(s.topicId));
  }

  async isSubscribed(userId, topicId) {
    return await DataContext.FindSubscriptionsById(userId, topicId);
  }

  async subscribe(userId, topicId) {
    const existing = await DataContext.FindSubscriptionsById(userId, topicId);
    console.log("Inside subscribe from SubscriptionModel");
    /*if (existing.length > 0) {
      return false;
    }*/
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
