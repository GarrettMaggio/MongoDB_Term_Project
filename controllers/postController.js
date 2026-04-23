const postModel = require('../models/postModel');
const topicModel = require('../models/topicModel');
const topicSubject = require('../services/observers/topicSubject');

async function createPost(req, res) {
  const topicId = (req.body.topicId || '').trim();
  const content = (req.body.content || '').trim();

  if (!topicId || !content) return res.redirect('back');
  const topic = await topicModel.findById(topicId);
  if (!topic) return res.status(400).text('Invalid topic');

  const post = await postModel.create({ topicId, userId: req.session.userId, content });
  await topicSubject.notify('post:created', post);
  res.redirect(`/topics/${topicId}`);
}

module.exports = { createPost };
