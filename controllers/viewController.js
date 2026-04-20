const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const subscriptionModel = require('../models/subscriptionModel');
const postModel = require('../models/postModel');
const db = require('../config/databaseSingleton').getInstance();
const { landingView, dashboardView } = require('../views/pages');
const DataContext = require('../data/datacontext');

async function landing(req, res) {
  const trending = await topicModel.getTrending(6);
  res.html(landingView({ trending }));
}

async function dashboard(req, res) {
  const user = await userModel.findById(req.session.userId);
  
  if (!user) {
    return res.redirect('/auth/login?msg=Please%20log%20in%20to%20access%20the%20dashboard');
  }

  const subscribedIds = await subscriptionModel.listTopicIdsByUser(user._id);
  const recents = await postModel.getRecentByTopics(subscribedIds, 2);
  const subscribedSummaries = await recents
    .map((r) => ({ topic: topicModel.findById(r.topicId), posts: r.posts }))
    .filter((r) => r.topic)
    .map((r) => ({
      ...r,
      posts: r.posts.map((p) => ({ ...p, userName: userModel.displayNameFor(p.userId) }))
    }));

    // Fix this first thing after morning class

  const activity = await DataContext.GetActivityLog().then((logs) => logs.map((entry) => ({
    ...entry,
    userName: userModel.displayNameFor(entry.userId),
    topicName: topicModel.findById(entry.topicId)?.name || entry.topicId
  })));

  res.html(dashboardView({
    user,
    subscribedSummaries,
    activity,
    trending: await topicModel.getTrending(5),
    subscribedTopics: subscribedSummaries.map((s) => s.topic)
  }));
}

module.exports = { landing, dashboard };
