const DatabaseSingleton = require('../config/databaseSingleton');

class UserModel {
  constructor() {
    this.db = DatabaseSingleton.getInstance();
  }

  findByCredentials(username, password) {
    return this.db.getCollection('users').find((u) => u.username === username && u.password === password);
  }

  create({ username, password }) {
    const users = this.db.getCollection('users');
    if (users.some((u) => u.username === username)) return null;
    const user = {
      id: `u${users.length + 1}`,
      username,
      password,
      displayName: username
    };
    users.push(user);
    return user;
  }

  findById(userId) {
    return this.db.getCollection('users').find((u) => u.id === userId);
  }

  toPublic(userId) {
    const user = this.findById(userId);
    return user ? { id: user.id, username: user.username, displayName: user.displayName } : null;
  }

  displayNameFor(userId) {
    return this.findById(userId)?.displayName || 'Unknown User';
  }
}

module.exports = new UserModel();
