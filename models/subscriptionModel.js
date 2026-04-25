const DataContext = require('../data/datacontext');

class SubscriptionModel {
  async getSubscriptions() {
    const subscriptions = await DataContext.GetSubscriptions();

    return Array.isArray(subscriptions)
      ? subscriptions.map((s) => ({
          ...s,
          id: s.id || s._id?.toString(),
          userId: s.userId?.toString() || '',
          topicId: s.topicId?.toString() || ''
        }))
      : [];
  }

  async listByUser(userId) {
    const subscriptions = await this.getSubscriptions();
    const id = userId?.toString();

    return subscriptions.filter((s) => s.userId === id);
  }

  async listTopicIdsByUser(userId) {
    const subscriptions = await this.listByUser(userId);
    return subscriptions.map((s) => s.topicId);
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
    return true;
  }

  async unsubscribe(userId, topicId) {
    const subscriptions = await DataContext.GetSubscriptions();
    const idx = subscriptions.FindSubscriptionsById((s) => s.userId === userId && s.topicId === topicId);
    if (idx === -1) return false;
    subscriptions.splice(idx, 1);
    return true;
  }
}

module.exports = new SubscriptionModel();