const topicModel = require('../models/topicModel');
const subscriptionModel = require('../models/subscriptionModel');
const postModel = require('../models/postModel');
const { exploreView, myTopicsView, topicView } = require('../views/pages');
const userModel = require('../models/userModel');



async function landing(req, res) {
  const trending = await topicModel.getTrending(6);
  console.log("TRENDING =", trending);
  console.log("IS ARRAY =", Array.isArray(trending));
  console.log("TYPE =", typeof trending);
  res.html(landingView({ trending }));  
}

async function explore(req, res) {
  const user = await userModel.findById(req.session.userId);
  const topics = await topicModel.getallTopics(); 
  const subscribedTopics = await subscriptionModel.getTopicIdsByUserId(req.session.userId);
  res.html(exploreView({ user, topics, subscribedTopics }));
}

async function myTopics(req, res) {
  const user = await userModel.findById(req.session.userId); 
  const topics = await subscriptionModel.getSubscriptions();
  res.html(myTopicsView({ user, topics }));
}

async function createTopic(req, res) {
  const user = await userModel.findById(req.session.userId);
  const name = (req.body.name || '').trim();
  const description = (req.body.description || '').trim();
  const tags = (req.body.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

  if (!name || !description) return res.redirect('/topics/explore?q=');

  const topic = await topicModel.create({ name, description, tags, createdBy: user._id });
  await subscriptionModel.subscribe(user._id, topic._id);
  res.redirect(`/topics/${topic._id}`);
}

async function subscribe(req, res) {
  console.log("Inside subscribe from topicController");
  if (await topicModel.findById(req.params.topicId)) {
    await subscriptionModel.subscribe(req.session.userId, req.params.topicId);
  }
  res.redirect('back');
}

async function unsubscribe(req, res) {
  const userId = req.session.userId?.toString();
  await subscriptionModel.unsubscribe(userId, req.params.topicId);
  res.redirect('back');
}

async function topicPage(req, res) {
  const user = await userModel.findById(req.session.userId);
  const topic = await topicModel.incrementAccess(req.params.topicId);
  if (!topic) {
    return res.status(404).text('Topic not found');
  }
  const posts = await postModel.listByTopic(topic._id);

  console.log("Post", posts);

  res.html(topicView({
    user,
    topic,
    posts,
    isSubscribed: await subscriptionModel.isSubscribed(user._id, topic._id)
  }));
}

module.exports = { explore, myTopics, createTopic, subscribe, unsubscribe, topicPage };