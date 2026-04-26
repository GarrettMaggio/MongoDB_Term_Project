//const DatabaseSingleton = require('../config/databaseSingleton');
const { db } = require('./userModel');
const DataContext = require('../data/datacontext');

class TopicModel {

  async getallTopics() {
    const topics = await DataContext.GetTopics();
    return topics;
  }

  async getTopicCount() {
    const topics = await DataContext.GetTopics();
    return topics.length;
  }

  async getStats() {
    const stats = await DataContext.GetStats();
    return stats; 
  }

  async getStatsByUser(userId) {
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
    return topics.find((topic) => topic.id === topicId);
  }

  async search(query = '') {
    const topics = await this.getallTopics();
    const term = query.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((topic) => (
      topic.name.toLowerCase().includes(term)
      || topic.description.toLowerCase().includes(term)
      || topic.tags.some((tag) => tag.toLowerCase().includes(term))
    ));
  }

  async getTrending(limit = 6) {
    const topics = await DataContext.GetTopics();
    
    if (!Array.isArray(topics)) {
      return [];
    }

    return topics
    .sort((a, b) => b.accessCount - a.accessCount)
    .slice(0, limit);
  }

  incrementAccess(topicId) {
    const topic = this.findById(topicId);
    if (topic) topic.accessCount += 1;
    return topic;
  }

  async create({ name, description, tags, createdBy }) {
    const topics = await this.getallTopics();
    const topic = {
      id: `t${topics.length + 1}`,
      name,
      description,
      tags,
      createdBy,
      accessCount: 0
    };
    topics.push(topic);
    //this.getallStats().push({ topicId: topic.id, totalPosts: 0, lastPostAt: null });
    return topic;
  }
}

module.exports = new TopicModel();
