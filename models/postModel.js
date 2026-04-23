const DataContext = require('../data/datacontext');

class PostModel {

  async getPosts() {
    const posts = await DataContext.GetPosts();
    return posts;
  }

  async listByTopic(topicId) {
    const posts = await DataContext.GetPosts();
    return posts
      .filter((post) => post.topicId === topicId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async create({ topicId, userId, content }) {
    const posts = await DataContext.CreatePost(topicId, userId, content);
    return posts;
  }



  // get the two most recent topics for each topicId in the provided list
  async getRecentByTopics(topicIds, limitPerTopic = 2) {
    if (!Array.isArray(topicIds) || topicIds.length === 0) return [];

    const grouped = await Promise.all(
      topicIds.map(async (topicId) => ({
        topicId,
        posts: await DataContext.GetPostsByTopic(topicId, limitPerTopic)
      }))
    );

    return grouped;
  }
}

module.exports = new PostModel();
