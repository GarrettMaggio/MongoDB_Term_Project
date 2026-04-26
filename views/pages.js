const { renderLayout } = require('./layout');

const fmt = (iso) => new Date(iso).toLocaleString();

function landingView({ trending = [] }) {
  
  const safeTrending = Array.isArray(trending) ? trending : [];
  const trendCards = safeTrending.map((topic) => `
    <article class="panel topic-card">
      <div class="topic-chip">${(topic.tags || []).slice(0, 2).join(' · ') || 'community'}</div>
      <h3>${topic.name}</h3>
      <p>${topic.description}</p>
      <div class="card-meta"><span>${topic.accessCount} visits</span><a href="/auth/login" class="text-link">View Topic</a></div>
    </article>`).join('');

  return renderLayout({
    title: 'Landing',
    body: `
      <section class="hero panel">
        <div class="hero-copy">
          <p class="eyebrow">Community Intelligence Dashboard</p>
          <h1>Track topics. Share insights. Build momentum.</h1>
          <p class="subtle">PulseBoard is a dark, social dashboard inspired by gaming stat hubs and discussion-first communities.</p>
          <form class="hero-search" action="/auth/login" method="GET">
            <input name="msg" value="Login%20to%20search%20and%20explore%20topics" hidden />
            <input placeholder="Search raid strats, PVP builds, dev topics, and more..." disabled />
            <button class="btn" type="submit">Enter Dashboard</button>
          </form>
          <div class="cta-row">
            <a class="btn" href="/auth/login">Login</a>
            <a class="btn btn-ghost" href="/auth/register">Create Account</a>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <h2>Trending Topics</h2>
          <p>Live mock data to keep demos populated and interactive.</p>
        </div>
        <div class="card-grid">${trendCards}</div>
      </section>

      <section class="promo-grid">
        <article class="panel"><h3>Post and discuss fast</h3><p>Create posts directly from dashboard or topic pages for a Twitter/Reddit-style flow.</p></article>
        <article class="panel"><h3>Track engagement</h3><p>Observer-driven stats and activity updates reflect every new post event in real time.</p></article>
      </section>`
  });
}

function authView(type, message = '') {
  const isLogin = type === 'login';
  return renderLayout({
    title: isLogin ? 'Login' : 'Register',
    message,
    body: `<section class="auth-wrap">
      <article class="panel auth-panel">
        <p class="eyebrow">${isLogin ? 'Welcome Back' : 'Join PulseBoard'}</p>
        <h2>${isLogin ? 'Sign in to your dashboard' : 'Create your account'}</h2>
        <form id="auth-form" method="POST" action="/auth/${type}">
          <label>Username</label>
          <input name="username" placeholder="your_name" required />
          <label>Password</label>
          <input name="password" type="password" placeholder="••••••••" required />
          <button class="btn" type="submit">${isLogin ? 'Login' : 'Register'}</button>
        </form>
        <p class="muted">${isLogin ? 'Need an account?' : 'Already have an account?'} <a class="text-link" href="/auth/${isLogin ? 'register' : 'login'}">${isLogin ? 'Register' : 'Login'}</a></p>
      </article>
    </section>`
  }); 
}

function dashboardView({ user, subscribedSummaries, trending, activity, subscribedTopics }) {
  const feed = subscribedSummaries.map((item) => `
    <article class="panel feed-topic">
      <div class="feed-topic-head">
        <h3><a class="text-link" href="/topics/${item.topic.id}">${item.topic.name}</a></h3>
        <span>${item.posts.length} recent posts</span>
      </div>
      ${item.posts.length ? item.posts.map((post) => `
        <div class="post-snippet">
          <p>${post.content}</p>
          <small>${post.userName} · ${fmt(post.createdAt)}</small>
        </div>`).join('') : '<p class="muted">No recent posts in this topic.</p>'}
    </article>`).join('') || '<article class="panel"><p class="muted">No subscriptions yet. Explore topics to build your feed.</p></article>';

  return renderLayout({
    title: 'Dashboard',
    user,
    active: 'dashboard',
    body: `<section class="dashboard-layout">
      <aside class="panel sidebar-left">
        <h3>${user.displayName}</h3>
        <p class="muted">Quick access</p>
        <a href="/dashboard" class="nav-pill">Home Feed</a>
        <a href="/topics/explore" class="nav-pill">Explore Topics</a>
        <a href="/topics/my" class="nav-pill">Manage Subscriptions</a>
        <a href="/stats" class="nav-pill">Stats & Activity</a>
      </aside>

      <section class="feed-column">
        <article class="panel composer">
          <h2>Create Post</h2>
          <form method="POST" action="/posts">
            <label>Post to topic</label>
            <select name="topicId" required>
              <option value="">Select subscribed topic</option>
              ${subscribedTopics.map((topic) => `<option value="${topic.id}">${topic.name}</option>`).join('')}
            </select>
            <textarea name="content" placeholder="Share an update, strategy, or question..." required></textarea>
            <button class="btn" type="submit">Publish Post</button>
          </form>
        </article>

        <div class="section-head"><h2>Subscribed Feed</h2><p>Showing 2 most recent posts per subscribed topic.</p></div>
        ${feed}
      </section>

      <aside class="panel sidebar-right">
        <h3>Trending</h3>
        ${trending.map((topic) => `<a class="trend-row" href="/topics/${topic.id}"><span>${topic.name}</span><small>${topic.accessCount} visits</small></a>`).join('')}
        <h3>Recent Activity</h3>
        ${activity.length ? activity.map((item) => `<div class="activity-row"><p><strong>${item.userName}</strong> posted in <strong>${item.topicName}</strong></p><small>${fmt(item.createdAt)}</small></div>`).join('') : '<p class="muted">No activity logged yet.</p>'}
      </aside>
    </section>`
  });
}

function exploreView({ user, topics, subscribedTopics }) {
  const rows = topics.map((topic) => {
    const subscribed = subscribedTopics.includes(topic._id.toString());
    return `<article class="panel topic-card">
      <div class="topic-chip">${topic.tags.join(' · ') || 'general'}</div>
      <h3><a class="text-link" href="/topics/${topic._id}">${topic.name}</a></h3>
      <p>${topic.description}</p>
      <div class="card-meta"><span>${topic.accessCount} visits</span></div>
      <form method="POST" action="/topics/${topic._id}/${subscribed ? 'unsubscribe' : 'subscribe'}">
        <button class="btn ${subscribed ? 'btn-ghost' : ''}">${subscribed ? 'Unsubscribe' : 'Subscribe'}</button>
      </form>
    </article>`;
  }).join('');

  return renderLayout({
    title: 'Explore Topics',
    topics,
    user,
    active: 'explore',
    body: `<section class="section-block">
      <div class="section-head">
        <h2>Explore Topics</h2>
        <p>Browse and subscribe to topics to customize your dashboard feed.</p>
      </div>
      <form class="search-row" method="GET">
        <input name="q" value="${topics}" placeholder="Search by name, description, or tag" />
        <button class="btn" type="submit">Search</button>
      </form>
      <div class="card-grid">${rows || '<article class="panel"><p class="muted">No topics found.</p></article>'}</div>
    </section>

    <section class="section-block">
      <div class="section-head"><h2>Create Topic</h2><p>Create and auto-subscribe in one step.</p></div>
      <article class="panel">
        <form method="POST" action="/topics">
          <label>Topic Name</label>
          <input name="name" placeholder="e.g., Sandbox Balance" required />
          <label>Tags</label>
          <input name="tags" placeholder="pvp, builds, strategy" />
          <label>Description</label>
          <textarea name="description" placeholder="What should people discuss here?" required></textarea>
          <button class="btn" type="submit">Create Topic</button>
        </form>
      </article>
    </section>`
  });
}

function myTopicsView({ user, topics }) {
  return renderLayout({
    title: 'My Topics',
    user,
    active: 'my-topics',
    body: `<section class="section-block">
      <div class="section-head"><h2>My Subscriptions</h2><p>Manage subscribed communities and jump straight into discussion.</p></div>
      <div class="card-grid">
        ${topics.map((topic) => `<article class="panel topic-card">
          <h3><a class="text-link" href="/topics/${topic.topicId }">${topic.name}</a></h3>
          <p>${topic.description}</p>
          <div class="topic-actions">
            <a class="btn btn-ghost" href="/topics/${topic.topicId}">Open Topic</a>
            <form method="POST" action="/topics/${topic.topicId}/unsubscribe"><button class="btn btn-ghost">Unsubscribe</button></form>
          </div>
        </article>`).join('') || '<article class="panel"><p class="muted">No subscriptions yet. Visit Explore to subscribe.</p></article>'}
      </div>
    </section>`
  });
}

function topicView({ user, topic, posts, isSubscribed }) {
  return renderLayout({
    title: topic.name,
    user,
    body: `<section class="section-block">
      <article class="panel topic-hero">
        <p class="eyebrow">Topic Discussion</p>
        <h1>${topic.name}</h1>
        <p>${topic.description}</p>
        <div class="topic-actions">
          <span class="topic-chip">${topic || 'general'}</span>
          <form method="POST" action="/topics/${topic._id}/${isSubscribed ? 'unsubscribe' : 'subscribe'}">
            <button class="btn ${isSubscribed ? 'btn-ghost' : ''}">${isSubscribed ? 'Unsubscribe' : 'Subscribe'}</button>
          </form>
        </div>
      </article>
    </section>

    <section class="section-block topic-layout">
      <article class="panel composer">
        <h2>Write a post</h2>
        <form method="POST" action="/posts">
          <input type="hidden" name="topicId" value="${topic._id}" />
          <textarea name="content" placeholder="Share your perspective..." required></textarea>
          <button class="btn" type="submit">Post to Topic</button>
        </form>
      </article>

      <div class="thread-list">
        ${posts.map((post) => `<article class="panel thread-post"><p>${post.content}</p><small>${post.userName} · ${fmt(post.createdAt)}</small></article>`).join('') || '<article class="panel"><p class="muted">No posts yet. Be the first one to post.</p></article>'}
      </div>
    </section>`
  });
}

function statsView({ stats, user, totalAccessCount, totalSubscriptions, totalPosts, }) {

  console.log('Rendering statsView with totalAccesscount:', totalAccessCount);

  const tabelRows = stats.map((row) => `
  <tr>
    <td><a class="text-link" href="/topics/${row.id}">${row.name}</a></td>
    <td>${row.tags.map(t => `<span class="topic-chip">${t}</span>`).join(' ')}</td>
    <td class="text-center">${row.accessCount}</td>
    <td class="text-center">${row.numPosts}</td>
    <td class="muted">${row.lastPostAt ? fmt(row.lastPostAt) : `<span class="subtle">-</span>`}</td>
    </tr>`).join('')

  return renderLayout({
    title: 'Stats',
    user,
    active: 'stats',
    body: `<section class="section-block">
      <div class="section-head"><h2>Topic Metrics</h2><p>Observer-updated post totals and engagement indicators.</p></div>
      <div class="stats-grid">
        <article class="panel"><h3>Total Topics</h3><p class="stat-value">${totalSubscriptions}</p></article>
        <article class="panel"><h3>Total Accesses</h3><p class="stat-value">${totalAccessCount}</p></article>
        <article class="panel"><h3>Total Posts</h3><p class="stat-value">${totalPosts}</p></article>
      </div>
      <article class="panel table-wrap">
        <table>
          <thead><tr><th>Topic</th><th>Tags</th><th>Access Count</th><th>Total Posts</th><th>Last Post</th></tr></thead>
          <tbody>${tabelRows || `<tr><td colspan="5" class="muted">No topics tracked yet.</td></tr>`}</tbody>
        </table>
      </article>
    </section>`
  });
}

module.exports = { landingView, authView, dashboardView, exploreView, myTopicsView, topicView, statsView };

