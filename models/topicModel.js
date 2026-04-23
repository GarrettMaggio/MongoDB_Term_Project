const DataContext = require('../data/datacontext');
const DatabaseSingleton = require('../config/databaseSingleton');
const { ObjectId } = require('mongodb');

class TopicModel {
  async getallTopics() {
    const topics = await DataContext.GetTopics();
    if (!Array.isArray(topics)) return [];
    return topics.map((topic) => ({
      ...topic,
      id: topic.id || topic._id?.toString()
    }));
  }

  async getAll() {
    return this.getallTopics();
  }

  async getallStats() {
    const stats = await DataContext.GetStats();
    return Array.isArray(stats) ? stats : [];
  }

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
    
    if (!Array.isArray(topics)) {
      return [];
    }

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
