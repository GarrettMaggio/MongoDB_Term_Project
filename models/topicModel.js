const DataContext = require('../data/datacontext');
const DatabaseSingleton = require('../config/databaseSingleton');
const { ObjectId } = require('mongodb');

class TopicModel {
  async getallTopics() {
    const topics = await DataContext.GetTopics();
    return Array.isArray(topics) ? topics : [];
  }

  async getTopicCount() {
    const topics = await DataContext.GetTopics();
    return topics.length;
  }

  async getallStats() {
    const stats = await DataContext.GetStats();
    return Array.isArray(stats) ? stats : [];
  }

  async getTopicCount() {
    const topics = await DataContext.GetTopics();
    return topics.length;
  }

  async getStats() {
    const stats = await DataContext.GetStats();
    const userStats = stats.filter(stat => stat.userId.toString() === userId.toString());
    return userStats;
  }
  
  /*async getTopicStats() {
    const topicStats = await DataContext.GetStats();
    return topicStats;
  }*/

  async findById(topicId) {
    const topics = await this.getallTopics();
    return topics.find((topic) => topic.id === topicId || topic._id?.toString() === topicId) || null;
  }

  async search(query = '') {
    const topics = await this.getallTopics();
    const term = query.trim().toLowerCase();

    if (!term) return topics;

    return topics.filter((topic) =>
      (topic.name || '').toLowerCase().includes(term) ||
      (topic.description || '').toLowerCase().includes(term) ||
      (Array.isArray(topic.tags) && topic.tags.some((tag) => tag.toLowerCase().includes(term)))
    );
  }

  async getTrending(limit = 6) {
    const topics = await this.getallTopics();

    return topics
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, limit);
  }

  async incrementAccess(topicId) {
    const db = await DatabaseSingleton.getInstance();

    await db.collection('Topics').updateOne(
      { _id: new ObjectId(topicId) },
      { $inc: { accessCount: 1 } }
    );

    return await this.findById(topicId);
  }

  async create({ name, description, tags, createdBy }) {
    const db = await DatabaseSingleton.getInstance();

    const newTopic = {
      name,
      description,
      tags: Array.isArray(tags) ? tags : [],
      createdBy: createdBy || null,
      accessCount: 0
    };

    const result = await db.collection('Topics').insertOne(newTopic);

    return {
      ...newTopic,
      id: result.insertedId.toString()
    };
  }
}

module.exports = new TopicModel();
