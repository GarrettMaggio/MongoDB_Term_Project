const DatabaseSingleton = require('../config/databaseSingleton');

class PostModel {
  constructor() {
    this.db = DatabaseSingleton.getInstance();
  }

  listByTopic(topicId) {
    return this.db.getCollection('posts')
      .filter((post) => post.topicId === topicId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  create({ topicId, userId, content }) {
    const posts = this.db.getCollection('posts');
    const post = {
      id: `p${posts.length + 1}`,
      topicId,
      userId,
      content,
      createdAt: new Date().toISOString()
    };
    posts.push(post);
    return post;
  }

  getRecentByTopics(topicIds, limitPerTopic = 2) {
    const allPosts = this.db.getCollection('posts');
    return topicIds.map((topicId) => ({
      topicId,
      posts: allPosts
        .filter((p) => p.topicId === topicId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limitPerTopic)
    }));
  }
}

module.exports = new PostModel();
