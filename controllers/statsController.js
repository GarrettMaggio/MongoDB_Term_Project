const postModel = require('../models/postModel');
const subscriptionModel = require('../models/subscriptionModel');
const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const DatabaseSingleton = require('../config/databaseSingleton');
const { statsView } = require('../views/pages');

async function statsPage(req, res) {
  const user = await userModel.findById(req.session.userId); 
  const stats = await topicModel.getallTopics(); 
  const totalAccessCount = await subscriptionModel.countTotalAccesses();
  
  console.log('total accesses count in statsController:', totalAccessCount);
  
  res.html(statsView({ 
    stats,
    user, 
    totalAccessCount,
    totalSubscriptions: await topicModel.getTopicCount(), 
    totalPosts: await postModel.countTotalPosts(), 
  }));
}

module.exports = { statsPage };
