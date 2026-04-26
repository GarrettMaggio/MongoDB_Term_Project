const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const activityModel = require('../models/activityModel');
const subscriptionModel = require('../models/subscriptionModel');
const postModel = require('../models/postModel');
const { landingView, dashboardView } = require('../views/pages');

async function landing(req, res) {
  const trending = await topicModel.getTrending(6);
  res.html(landingView({ trending }));
}

async function dashboard(req, res) {
  const user = await userModel.findById(req.session.userId);

  if (!user) {
    return res.redirect('/auth/login?msg=Please%20log%20in');
  }

  const subscribedIds = await subscriptionModel.listTopicIdsByUser(user._id);

  const recents = await postModel.getRecentByTopics(subscribedIds, 2);

  const subscribedSummaries = await Promise.all(recents.map(async (r) => {
    const topic = await topicModel.findById(r.topicId);
    if (!topic) return null;

    const postsWithNames = await Promise.all(r.posts.map(async (p) => ({
      ...p,
      userName: await userModel.displayNameFor(p.userId)
    })));

    return { topic, posts: postsWithNames };
  }));

  const logs = await activityModel.getActivityLog();
  const activity = await Promise.all(logs.map(async (entry) => {
    const topic = await topicModel.findById(entry.topicId);
    return {
      ...entry,
      userName: await userModel.displayNameFor(entry.userId),
      topicName: topic?.name || 'General'
    };
  }));

  res.html(dashboardView({
    user,
    subscribedSummaries: subscribedSummaries.filter(Boolean), 
    activity,
    trending: await topicModel.getTrending(5),
    subscribedTopics: subscribedSummaries.filter(Boolean).map(s => s.topic)
  }));
}


module.exports = { landing, dashboard };