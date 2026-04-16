const postModel = require('../models/postModel');
const topicModel = require('../models/topicModel');
const topicSubject = require('../services/observers/topicSubject');

function createPost(req, res) {
  const topicId = (req.body.topicId || '').trim();
  const content = (req.body.content || '').trim();

  if (!topicId || !content) return res.redirect('back');
  if (!topicModel.findById(topicId)) return res.status(400).text('Invalid topic');

  const post = postModel.create({ topicId, userId: req.session.userId, content });
  topicSubject.notify('post:created', post);
  res.redirect(`/topics/${topicId}`);
}

module.exports = { createPost };
