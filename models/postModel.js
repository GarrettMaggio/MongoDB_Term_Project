const DataContext = require('../data/datacontext');

class PostModel {

  async getPosts() {
    const posts = await DataContext.GetPosts();
    return posts;
  }

  async listByTopic(topicId) {
    const posts = await DataContext.GetPosts();
    return posts
      .filter((post) => post.topicId.toString() === topicId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async create({ topicId, userId, content }) {
    const posts = await DataContext.CreatePost(topicId, userId, content);
    return posts;
  }

  // get the two most recent topics for each topicId in the provided list
  async getRecentByTopics(topicIds, limitPerTopic = 2) {
    const recentPosts = await DataContext.GetPostsByTopic(topicIds, limitPerTopic);
    return recentPosts;
  }

  async countTotalPosts() {
    const posts = await DataContext.GetPosts();
    return posts.length;
  }
}

module.exports = new PostModel();
