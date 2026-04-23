const DatabaseSingleton = require('../config/databaseSingleton');
const DataContext = require('../data/datacontext');

class SubscriptionModel {
  async getSubscriptions() {
    const subscriptions = await DataContext.GetSubscriptions();
    return Array.isArray(subscriptions) ? subscriptions.map((s) => ({
      ...s,
      id: s.id || s._id?.toString(),
      userId: s.userId || '',
      topicId: s.topicId || ''
    })) : [];
  }

  async listByUser(userId) {
    const subscriptions = await this.getSubscriptions();
    return subscriptions.filter((s) => s.userId === userId);
  }

  async listTopicIdsByUser(userId) {
    const subscriptions = await this.listByUser(userId);
    return subscriptions.map((s) => s.topicId);
  }

  async isSubscribed(userId, topicId) {
    const subscriptions = await this.getSubscriptions();
    return subscriptions.some((s) => s.userId === userId && s.topicId === topicId);
  }

  async subscribe(userId, topicId) {
    const db = await DatabaseSingleton.getInstance();

    const existing = await db.collection('Subscriptions').findOne({ userId, topicId });
    if (existing) {
      return {
        ...existing,
        id: existing._id?.toString()
      };
    }

    const newSubscription = { userId, topicId };
    const result = await db.collection('Subscriptions').insertOne(newSubscription);

    return {
      ...newSubscription,
      id: result.insertedId.toString()
    };
  }

  async unsubscribe(userId, topicId) {
    const db = await DatabaseSingleton.getInstance();
    await db.collection('Subscriptions').deleteOne({ userId, topicId });
    return true;
  }
}

module.exports = new SubscriptionModel();