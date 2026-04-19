const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const subscriptionModel = require('../models/subscriptionModel');
const postModel = require('../models/postModel');
const DatabaseSingleton = require('../config/databaseSingleton');
const { landingView, dashboardView } = require('../views/pages');

async function landing(req, res) {
  const trending = await topicModel.getTrending(6);
  res.html(landingView({ trending }));
}

async function dashboard(req, res) {
  const user = await userModel.findById(req.session.userId);
  const subscribedIds = await subscriptionModel.listTopicIdsByUser(user.id);
  const recents = await postModel.getRecentByTopics(subscribedIds, 2);

  const subscribedSummariesRaw = await Promise.all(
    recents.map(async (r) => ({
      topic: await topicModel.findById(r.topicId),
      posts: r.posts
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

  const db = await DatabaseSingleton.getInstance();
  const activityCollection = db.collection('activityLog');
  const activityDocs = await activityCollection.find({}).limit(8).toArray();

  const activity = await Promise.all(
    activityDocs.map(async (entry) => ({
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
      subscribedTopics: subscribedSummaries.map((s) => s.topic)
    })
  );
}

module.exports = { landing, dashboard };
