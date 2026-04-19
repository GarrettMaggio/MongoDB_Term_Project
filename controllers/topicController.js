const topicModel = require('../models/topicModel');
const subscriptionModel = require('../models/subscriptionModel');
const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const { exploreView, myTopicsView, topicView } = require('../views/pages');

async function explore(req, res) {
  const user = await userModel.findById(req.session.userId);
  const query = req.query.q || '';
  const topics = await topicModel.search(query);
  const subscribedTopicIds = await subscriptionModel.listTopicIdsByUser(user.id);

  res.html(exploreView({ user, topics, subscribedTopicIds, query }));
}

async function myTopics(req, res) {
  const user = await userModel.findById(req.session.userId);
  const subscriptions = await subscriptionModel.listByUser(user.id);

  const topics = await Promise.all(
    subscriptions.map((s) => topicModel.findById(s.topicId))
  );

  res.html(myTopicsView({ user, topics: topics.filter(Boolean) }));
}

async function createTopic(req, res) {
  const user = await userModel.findById(req.session.userId);
  const name = (req.body.name || '').trim();
  const description = (req.body.description || '').trim();
  const tags = (req.body.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (!name || !description) {
    return res.redirect('/topics/explore?q=');
  }

  const topic = await topicModel.create({
    name,
    description,
    tags,
    createdBy: user.id
  });

  await subscriptionModel.subscribe(user.id, topic.id);
  res.redirect(`/topics/${topic.id}`);
}

async function subscribe(req, res) {
  const topic = await topicModel.findById(req.params.topicId);

  if (topic) {
    await subscriptionModel.subscribe(req.session.userId, req.params.topicId);
  }

  res.redirect('back');
}

async function unsubscribe(req, res) {
  await subscriptionModel.unsubscribe(req.session.userId, req.params.topicId);
  res.redirect('back');
}

async function topicPage(req, res) {
  const user = await userModel.findById(req.session.userId);
  const topic = await topicModel.incrementAccess(req.params.topicId);

  if (!topic) {
    return res.status(404).text('Topic not found');
  }

  const posts = await postModel.listByTopic(topic.id);
  const formattedPosts = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      userName: await userModel.displayNameFor(post.userId)
    }))
  );

  res.html(topicView({
    user,
    topic,
    posts: formattedPosts,
    isSubscribed: await subscriptionModel.isSubscribed(user.id, topic.id)
  }));
}

module.exports = { explore, myTopics, createTopic, subscribe, unsubscribe, topicPage };
