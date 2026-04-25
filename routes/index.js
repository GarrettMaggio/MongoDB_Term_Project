const { landing, dashboard } = require('../controllers/viewController');
const { loginPage, registerPage, login, register, logout } = require('../controllers/authController');
const { explore, myTopics, createTopic, subscribe, unsubscribe, topicPage } = require('../controllers/topicController');
const { createPost } = require('../controllers/postController');
const { statsPage } = require('../controllers/statsController');
const { topicStatsApi } = require('../controllers/modelController');
const { meApi } = require('../controllers/userController');

module.exports = [
  { method: 'GET', path: /^\/$/, handler: landing },
  { method: 'GET', path: /^\/dashboard$/, handler: dashboard, auth: true },

  { method: 'GET', path: /^\/auth\/login$/, handler: loginPage },
  { method: 'GET', path: /^\/auth\/register$/, handler: registerPage },
  { method: 'POST', path: /^\/auth\/login$/, handler: login },
  { method: 'POST', path: /^\/auth\/register$/, handler: register },
  { method: 'POST', path: /^\/auth\/logout$/, handler: logout, auth: true },

  { method: 'GET', path: /^\/topics\/explore$/, handler: explore, auth: true },
  { method: 'GET', path: /^\/topics\/my$/, handler: myTopics, auth: true },
  { method: 'POST', path: /^\/topics$/, handler: createTopic, auth: true },
  { method: 'POST', path: /^\/topics\/([^/]+)\/subscribe$/,  handler: async (req, res, m) => { req.params.topicId = m[1]; await subscribe(req, res); }, auth: true },
  { method: 'POST', path: /^\/topics\/([^/]+)\/unsubscribe$/, handler: async (req, res, m) => { req.params.topicId = m[1]; await unsubscribe(req, res); }, auth: true },
  { method: 'GET', path: /^\/topics\/([^/]+)$/, handler: async (req, res, m) => { req.params.topicId = m[1]; await topicPage(req, res); }, auth: true },

  { method: 'POST', path: /^\/posts$/, handler: createPost, auth: true },
  { method: 'GET', path: /^\/stats$/, handler: statsPage, auth: true },

  { method: 'GET', path: /^\/api\/topics\/stats$/, handler: topicStatsApi, auth: true },
  { method: 'GET', path: /^\/api\/users\/me$/, handler: meApi, auth: true }
];

