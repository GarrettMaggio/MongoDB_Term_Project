function renderLayout({ title, body, user, active = '', message = '' }) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} · PulseBoard</title>
    <link rel="stylesheet" href="/css/app.css" />
  </head>
  <body>
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="/">PulseBoard</a>
        <nav>
          ${user ? `<a ${active === 'dashboard' ? 'class="active"' : ''} href="/dashboard">Dashboard</a>
          <a ${active === 'explore' ? 'class="active"' : ''} href="/topics/explore">Explore</a>
          <a ${active === 'my-topics' ? 'class="active"' : ''} href="/topics/my">My Topics</a>
          <a ${active === 'stats' ? 'class="active"' : ''} href="/stats">Stats</a>
          <form method="POST" action="/auth/logout" class="inline"><button class="btn btn-ghost">Logout</button></form>` : `<a href="/auth/login">Login</a><a href="/auth/register">Register</a>`}
        </nav>
      </div>
    </header>
    <main class="app-shell">
      ${message ? `<div class="flash">${message}</div>` : ''}
      ${body}
    </main>
    <script src="/js/app.js"></script>
  </body>
  </html>`;
}

module.exports = { renderLayout };
