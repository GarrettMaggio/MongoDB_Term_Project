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
