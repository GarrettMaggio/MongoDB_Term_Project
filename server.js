const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const routes = require('./routes');
const topicSubject = require('./services/observers/topicSubject');
const ActivityObserver = require('./services/observers/activityObserver');
const StatsObserver = require('./services/observers/statsObserver');

function loadEnvFromRoot() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex < 1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFromRoot();


topicSubject.attach(new ActivityObserver());
topicSubject.attach(new StatsObserver());

const sessions = new Map();

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(cookieHeader.split(';').map((c) => c.trim()).filter(Boolean).map((c) => c.split('=')));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        resolve(JSON.parse(body || '{}'));
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        resolve(Object.fromEntries(new URLSearchParams(body)));
      } else {
        resolve({});
      }
    });
  });
}

function serveStatic(req, res, pathname) {
  if (!pathname.startsWith('/css/') && !pathname.startsWith('/js/')) return false;
  const filePath = path.join(__dirname, 'public', pathname.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': pathname.endsWith('.css') ? 'text/css' : 'application/javascript' });
  res.end(content);
  return true;
}

function createResponse(req, res, query) {
  return {
    html: (content, status = 200) => { res.writeHead(status, { 'Content-Type': 'text/html' }); res.end(content); },
    json: (payload, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(payload)); },
    text: (content, status = 200) => { res.writeHead(status, { 'Content-Type': 'text/plain' }); res.end(content); },
    status: (statusCode) => ({
      json: (payload) => { res.writeHead(statusCode, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(payload)); },
      text: (content) => { res.writeHead(statusCode, { 'Content-Type': 'text/plain' }); res.end(content); }
    }),
    redirect: (location) => {
      const target = location === 'back' ? req.headers.referer || '/dashboard' : location;
      res.writeHead(302, { Location: target });
      res.end();
    },
    query
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (serveStatic(req, res, url.pathname)) return;

  const cookies = parseCookies(req.headers.cookie);
  let sid = cookies.sid;
  if (!sid || !sessions.has(sid)) {
    sid = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessions.set(sid, {});
    res.setHeader('Set-Cookie', `sid=${sid}; Path=/; HttpOnly`);
  }

  const reqExt = {
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    body: await parseBody(req),
    headers: req.headers,
    session: sessions.get(sid),
    params: {}
  };

  const resExt = createResponse(req, res, reqExt.query);

  const route = routes.find((r) => r.method === req.method && r.path.test(url.pathname));
  if (!route) return resExt.text('Not Found', 404);
  if (route.auth && !reqExt.session.userId) return resExt.redirect('/auth/login?msg=Please%20login');

  const match = url.pathname.match(route.path);
  route.handler(reqExt, resExt, match);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
