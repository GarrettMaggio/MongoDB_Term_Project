// userModel is connected to the database.
const DatabaseSingleton = require('../config/databaseSingleton');
const DataContext = require('../data/datacontext');

class UserModel {
  /*constructor() {
    this.db = DatabaseSingleton.getInstance();
  }*/

  async findByCredentials(username, password) {
    const users = await DataContext.ConnectUser();
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      console.log('User not found with provided credentials');
      return null;
    }
    return user;
    //return this.db.getCollection('users').find((u) => u.username === username && u.password === password);
  }

  async create({ username, password }) {
    const users = await DataContext.ConnectUser();
    if (!users) return null;
    const user = {
      _id: `u${users.length + 1}`,
      username,
      password,
      displayName: username
    };
    return user;
  }

  async findById(userId) {
    return await DataContext.ConnectUser().find('users').find((u) => u._id === userId);
  }

  toPublic(userId) {
    const user = this.findById(userId);
    return user ? { id: user._id, username: user.username, displayName: user.displayName } : null;
  }

  displayNameFor(userId) {
    return this.findById(userId)?.displayName || 'Unknown User';
  }
}

module.exports = new UserModel();
