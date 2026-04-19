//const DatabaseSingleton = require('../config/databaseSingleton');
const DataContext = require('../data/datacontext');


class PostModel {

  getPosts() {
    const posts = DataContext.GetPosts();
    return posts;
  }

  listByTopic(topicId) {
    return this.getPosts()
      .filter((post) => post.topicId === topicId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  create({ topicId, userId, content }) {
    const posts = this.getPosts();
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
    const allPosts = this.getPosts();
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
