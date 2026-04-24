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
    return res.redirect('/auth/login');
  }

  const userId = user.id || user._id?.toString();

  const subscribedIds = await subscriptionModel.listTopicIdsByUser(userId);

  const subscribedTopicsRaw = await Promise.all(
    subscribedIds.map((topicId) => topicModel.findById(topicId))
  );

  const subscribedTopics = subscribedTopicsRaw.filter(Boolean);

  const recents = await postModel.getRecentByTopics(subscribedIds, 2);

  const subscribedSummariesRaw = await Promise.all(
    recents.map(async (r) => ({
      topic: await topicModel.findById(r.topicId),
      posts: r.posts || []
    }))
  );

  const subscribedSummaries = await Promise.all(
    subscribedSummariesRaw
      .filter((r) => r.topic)
      .map(async (r) => ({
        ...r,
        posts: await Promise.all(
          r.posts.map(async (p) => ({
            ...p,
            userName: await userModel.displayNameFor(p.userId)
          }))
        )
      }))
  );

  let activity = [];

  if (activityModel && typeof activityModel.listRecent === 'function') {
    activity = await activityModel.listRecent(8);
  }

  activity = await Promise.all(
    activity.map(async (entry) => ({
      ...entry,
      userName: await userModel.displayNameFor(entry.userId),
      topicName: (await topicModel.findById(entry.topicId))?.name || entry.topicId
    }))
  );

  const trending = await topicModel.getTrending(5);

  res.html(
    dashboardView({
      user,
      subscribedSummaries,
      trending,
      activity,
      subscribedTopics
    })
  );
}

module.exports = { landing, dashboard };