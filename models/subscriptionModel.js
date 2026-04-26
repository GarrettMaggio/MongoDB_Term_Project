const DataContext = require('../data/datacontext');

class SubscriptionModel {
  async getSubscriptions() {
    const subscriptions = await DataContext.GetSubscriptions();
    return subscriptions;
  }

  /*async listByUser(userId) {
    return await this.getSubscriptions().filter((s) => s.userId === userId);
  }*/

  async getTopicIdsByUserId(userId) {
    const allSubs = await DataContext.GetSubscriptions();
    // Filter by the specific user and return just the topicId as a string
    return allSubs
  }

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
