const DatabaseSingleton = require('../config/databaseSingleton');
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
    return Array.isArray(subscriptions) ? subscriptions.map((s) => ({
      ...s,
      id: this.normalizeId(s.id || s._id),
      userId: this.normalizeId(s.userId),
      topicId: this.normalizeId(s.topicId)
    })) : [];
  }

  async listByUser(userId) {
    const normalizedUserId = this.normalizeId(userId);
    const subscriptions = await this.getSubscriptions();
    return subscriptions.filter((s) => s.userId === normalizedUserId);
  }

  async listTopicIdsByUser(userId) {
    const subscriptions = await this.listByUser(userId);
    return subscriptions.map((s) => s.topicId);
  }

  async isSubscribed(userId, topicId) {
    const normalizedUserId = this.normalizeId(userId);
    const normalizedTopicId = this.normalizeId(topicId);
    const subscriptions = await this.getSubscriptions();
    return subscriptions.some((s) => s.userId === normalizedUserId && s.topicId === normalizedTopicId);
  }

  async subscribe(userId, topicId) {
    const db = await DatabaseSingleton.getInstance();
    const normalizedUserId = this.normalizeId(userId);
    const normalizedTopicId = this.normalizeId(topicId);

    const existing = await db.collection('Subscriptions').findOne({
      userId: normalizedUserId,
      topicId: normalizedTopicId
    });
    if (existing) {
      return {
        ...existing,
        id: this.normalizeId(existing._id),
        userId: this.normalizeId(existing.userId),
        topicId: this.normalizeId(existing.topicId)
      };
    }

    const newSubscription = { userId: normalizedUserId, topicId: normalizedTopicId };
    const result = await db.collection('Subscriptions').insertOne(newSubscription);

    return {
      ...newSubscription,
      id: this.normalizeId(result.insertedId)
    };
  }

  async unsubscribe(userId, topicId) {
    const db = await DatabaseSingleton.getInstance();
    await db.collection('Subscriptions').deleteOne({
      userId: this.normalizeId(userId),
      topicId: this.normalizeId(topicId)
    });
    return true;
  }
}

module.exports = new SubscriptionModel();
