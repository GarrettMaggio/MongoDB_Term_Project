const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const activityModel = require('../models/activityModel')
const subscriptionModel = require('../models/subscriptionModel');
const postModel = require('../models/postModel');
const DatabaseSingleton = require('../config/databaseSingleton');
const { landingView, dashboardView } = require('../views/pages');

async function landing(req, res) {
  const trending = await topicModel.getTrending(6);
  res.html(landingView({ trending }));
}

async function dashboard(req, res) {
  const user = userModel.findById(req.session.userId);
  const subscribedIds = subscriptionModel.listTopicIdsByUser(user.id);
  const recents = postModel.getRecentByTopics(subscribedIds, 2);
  const subscribedSummaries = recents
    .map((r) => ({ topic: topicModel.findById(r.topicId), posts: r.posts }))
    .filter((r) => r.topic)
    .map((r) => ({
      ...r,
      posts: r.posts.map((p) => ({ ...p, userName: userModel.displayNameFor(p.userId) }))
    }));

  const activity = db.getCollection('activityLog').slice(0, 8).map((entry) => ({
    ...entry,
    userName: userModel.displayNameFor(entry.userId),
    topicName: topicModel.findById(entry.topicId)?.name || entry.topicId
  }));

  res.html(dashboardView({
    user,
    subscribedSummaries,
    trending: topicModel.getTrending(5),
    activity,
    subscribedTopics: subscribedSummaries.map((s) => s.topic)
  }));
}

module.exports = { landing, dashboard };
