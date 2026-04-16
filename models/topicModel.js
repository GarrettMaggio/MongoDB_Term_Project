const DatabaseSingleton = require('../config/databaseSingleton');

class TopicModel {
  constructor() {
    this.db = DatabaseSingleton.getInstance();
  }

  getAll() {
    return this.db.getCollection('topics');
  }

  findById(topicId) {
    return this.getAll().find((topic) => topic.id === topicId);
  }

  search(query = '') {
    const term = query.trim().toLowerCase();
    if (!term) return this.getAll();
    return this.getAll().filter((topic) => (
      topic.name.toLowerCase().includes(term)
      || topic.description.toLowerCase().includes(term)
      || topic.tags.some((tag) => tag.toLowerCase().includes(term))
    ));
  }

  getTrending(limit = 6) {
    return [...this.getAll()].sort((a, b) => b.accessCount - a.accessCount).slice(0, limit);
  }

  incrementAccess(topicId) {
    const topic = this.findById(topicId);
    if (topic) topic.accessCount += 1;
    return topic;
  }

  create({ name, description, tags, createdBy }) {
    const topics = this.getAll();
    const topic = {
      id: `t${topics.length + 1}`,
      name,
      description,
      tags,
      createdBy,
      accessCount: 0
    };
    topics.push(topic);
    this.db.getCollection('topicStats').push({ topicId: topic.id, totalPosts: 0, lastPostAt: null });
    return topic;
  }
}

module.exports = new TopicModel();
