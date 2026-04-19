const DatabaseSingleton = require('../config/databaseSingleton');

async function getDatabase() {
  return await DatabaseSingleton.getInstance();
}

class DataContext {
  static async ConnectUser() {
    const db = await getDatabase();
    const users = await db.collection('Users').find({}).toArray();

    return users.map((user) => ({
      ...user,
      id: user.id || user._id?.toString()
    }));
  }

  static async GetTopics() {
    const db = await getDatabase();
    const topics = await db.collection('Topics').find({}).toArray();

    return topics.map((topic) => ({
      ...topic,
      id: topic.id || topic._id?.toString(),
      name: topic.name || topic.title || '',
      description: topic.description || topic.summary || '',
      tags: Array.isArray(topic.tags) ? topic.tags : [],
      accessCount: topic.accessCount ?? topic.visits ?? 0,
      createdBy: topic.createdBy || null
    }));
  }

  static async GetSubscriptions() {
    const db = await getDatabase();
    const subscriptions = await db.collection('Subscriptions').find({}).toArray();

    return subscriptions.map((sub) => ({
      ...sub,
      id: sub.id || sub._id?.toString(),
      userId: sub.userId || '',
      topicId: sub.topicId || ''
    }));
  }

  static async GetStats() {
    const db = await getDatabase();
    const stats = await db.collection('Stats').find({}).toArray();

    return stats.map((stat) => ({
      ...stat,
      id: stat.id || stat._id?.toString(),
      name: stat.name || stat.title || '',
      tags: Array.isArray(stat.tags) ? stat.tags : [],
      accessCount: stat.accessCount ?? stat.visits ?? 0,
      totalPosts: stat.totalPosts ?? 0,
      lastPostAt: stat.lastPostAt || null
    }));
  }
}

module.exports = DataContext; 
