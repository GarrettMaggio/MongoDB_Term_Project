const DatabaseSingleton = require('../config/databaseSingleton');
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
    const subscriptions = await this.getSubscriptions();
    const uid = userId?.toString();
    const tid = topicId?.toString();

    return subscriptions.some((s) => s.userId === uid && s.topicId === tid);
  }

  async subscribe(userId, topicId) {
    const db = await DatabaseSingleton.getInstance();

    const uid = userId?.toString();
    const tid = topicId?.toString();

    const existing = await db.collection('Subscriptions').findOne({
      userId: uid,
      topicId: tid
    });

    if (existing) {
      return {
        ...existing,
        id: existing._id?.toString(),
        userId: existing.userId?.toString(),
        topicId: existing.topicId?.toString()
      };
    }

    const newSubscription = {
      userId: uid,
      topicId: tid
    };

    const result = await db.collection('Subscriptions').insertOne(newSubscription);

    return {
      ...newSubscription,
      id: result.insertedId.toString()
    };
  }

  async unsubscribe(userId, topicId) {
    const db = await DatabaseSingleton.getInstance();

    await db.collection('Subscriptions').deleteOne({
      userId: userId?.toString(),
      topicId: topicId?.toString()
    });

    return true;
  }
}

module.exports = new SubscriptionModel();