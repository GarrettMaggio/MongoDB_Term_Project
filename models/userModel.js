const DataContext = require('../data/datacontext');

class UserModel {

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

  async create({ username, password, displayName }) {
    const usersId = await DataContext.CreateUser(username, password, displayName);
    if (!usersId) return null;
    const user = {
      _id: usersId,
      username,
      password,
      displayName: username
    };
    return user;
  }

  async findById(userId) {
    return await DataContext.FindUserById(userId);
  }

  toPublic(userId) {
    const user = this.findById(userId);
    return user ? { id: user._id, username: user.username, displayName: user.displayName } : null;
  }

  async displayNameFor(userId) {
    const user = await this.findById(userId);
    return user?.displayName || 'Unknown User';
  }
}

module.exports = new UserModel();
