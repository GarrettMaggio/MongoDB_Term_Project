const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const activityModel = require('../models/activityModel')
const subscriptionModel = require('../models/subscriptionModel');
const postModel = require('../models/postModel');
const { landingView, dashboardView } = require('../views/pages');

async function landing(req, res) {
  const trending = await topicModel.getTrending(6);
  res.html(landingView({ trending }));
}

async function dashboard(req, res) {
  const sessionUserId = req.session.userId?.toString();
  const user = await userModel.findById(sessionUserId);
  
  if (!user) {
    return res.redirect('/auth/login?msg=Please%20log%20in%20to%20access%20the%20dashboard');
  }

  const subscribedIds = await subscriptionModel.listTopicIdsByUser(user.id || user._id?.toString());
  const recents = await postModel.getRecentByTopics(subscribedIds, 2);
  const subscribedSummaries = (
    await Promise.all(recents.map(async (r) => ({
      topic: await topicModel.findById(r.topicId),
      posts: await Promise.all((r.posts || []).map(async (p) => ({
        ...p,
        userName: await userModel.displayNameFor(p.userId)
      })))
    })))
  ).filter((r) => r.topic);

    // Fix this first thing after morning class

  const activityLogs = await activityModel.getActivityLog();
  const activity = await Promise.all(activityLogs.map(async (entry) => {
    const topic = await topicModel.findById(entry.topicId);
    return {
      ...entry,
      userName: await userModel.displayNameFor(entry.userId),
      topicName: topic?.name || entry.topicId
    };
  }));

  res.html(dashboardView({
    user,
    subscribedSummaries,
    activity,
    trending: await topicModel.getTrending(5),
    subscribedTopics: subscribedSummaries.map((s) => s.topic)
  }));
}

module.exports = { landing, dashboard };
