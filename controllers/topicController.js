const topicModel = require('../models/topicModel');
const subscriptionModel = require('../models/subscriptionModel');
const postModel = require('../models/postModel');
const { exploreView, myTopicsView, topicView } = require('../views/pages');
const userModel = require('../models/userModel');
const DataContext = require('../data/datacontext');
//const { landingView } = require('../views/pages');


async function landing(req, res) {
  const trending = await topicModel.getTrending(6);
  console.log("TRENDING =", trending);
  console.log("IS ARRAY =", Array.isArray(trending));
  console.log("TYPE =", typeof trending);
  res.html(landingView({ trending }));  
}

async function explore(req, res) {
  const user = userModel.findById(req.session.userId);
  const query = req.query.q || '';
  const topics = await topicModel.search(query);
  const subscribedTopicIds = subscriptionModel.listTopicIdsByUser(user.id);
  res.html(exploreView({ user, topics, subscribedTopicIds, query }));
}

function myTopics(req, res) {
  const user = userModel.findById(req.session.userId);
  const topics = subscriptionModel.listByUser(user.id).map((s) => topicModel.findById(s.topicId)).filter(Boolean);
  res.html(myTopicsView({ user, topics }));
}

function createTopic(req, res) {
  const user = userModel.findById(req.session.userId);
  const name = (req.body.name || '').trim();
  const description = (req.body.description || '').trim();
  const tags = (req.body.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

  if (!name || !description) return res.redirect('/topics/explore?q=');

  const topic = topicModel.create({ name, description, tags, createdBy: user.id });
  subscriptionModel.subscribe(user.id, topic.id);
  res.redirect(`/topics/${topic.id}`);
}

function subscribe(req, res) {
  if (topicModel.findById(req.params.topicId)) {
    subscriptionModel.subscribe(req.session.userId, req.params.topicId);
  }
  res.redirect('back');
}

function unsubscribe(req, res) {
  subscriptionModel.unsubscribe(req.session.userId, req.params.topicId);
  res.redirect('back');
}

function topicPage(req, res) {
  const user = userModel.findById(req.session.userId);
  const topic = topicModel.incrementAccess(req.params.topicId);
  if (!topic) return res.status(404).text('Topic not found');

  const posts = postModel.listByTopic(topic.id).map((post) => ({
    ...post,
    userName: userModel.displayNameFor(post.userId)
  }));

  res.html(topicView({
    user,
    topic,
    posts,
    isSubscribed: subscriptionModel.isSubscribed(user.id, topic.id)
  }));
}

module.exports = { explore, myTopics, createTopic, subscribe, unsubscribe, topicPage };
