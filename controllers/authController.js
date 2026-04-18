const userModel = require('../models/userModel');
const { authView } = require('../views/pages');

function loginPage(req, res) {
  res.html(authView('login', req.query.msg));
}

function registerPage(req, res) {
  res.html(authView('register', req.query.msg));
}

function login(req, res) {
  const username = (req.body.username || '').trim();
  const password = (req.body.password || '').trim();
  if (!username || !password) return res.redirect('/auth/login?msg=Enter%20username%20and%20password');

  const user = userModel.findByCredentials(username, password);
  if (!user) return res.redirect('/auth/login?msg=Invalid%20credentials');
  req.session.userId = user.id;
  return res.redirect('/dashboard');
}

function register(req, res) {
  const username = (req.body.username || '').trim();
  const password = (req.body.password || '').trim();
  if (!username || !password) return res.redirect('/auth/register?msg=All%20fields%20are%20required');

  const user = userModel.create({ username, password });
  if (!user) return res.redirect('/auth/register?msg=Username%20already%20exists');
  req.session.userId = user.id;
  return res.redirect('/dashboard');
}

function logout(req, res) {
  req.session.userId = null;
  res.redirect('/');
}

module.exports = { loginPage, registerPage, login, register, logout };
