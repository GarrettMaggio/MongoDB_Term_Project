const DatabaseSingleton = require('../config/databaseSingleton');
const DataContext = require('../data/datacontext');

class UserModel {
  async getAllUsers() {
    const users = await DataContext.ConnectUser();
    return Array.isArray(users) ? users : [];
  }

  async findByCredentials(username, password) {
    const users = await this.getAllUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      console.log('User not found with provided credentials');
      return null;
    }

    return {
      ...user,
      id: user.id || user._id?.toString()
    };
  }

  async create({ username, password }) {
    const db = await DatabaseSingleton.getInstance();

    const newUser = {
      username,
      password,
      displayName: username
    };

    const result = await db.collection('Users').insertOne(newUser);

    return {
      ...newUser,
      id: result.insertedId.toString(),
      _id: result.insertedId.toString()
    };
  }

  async findById(userId) {
    const users = await this.getAllUsers();
    return users.find((u) => (u.id || u._id?.toString()) === userId) || null;
  }

  async toPublic(userId) {
    const user = await this.findById(userId);
    return user
      ? {
          id: user.id || user._id?.toString(),
          username: user.username,
          displayName: user.displayName
        }
      : null;
  }

  async displayNameFor(userId) {
    const user = await this.findById(userId);
    return user?.displayName || 'Unknown User';
  }
}

module.exports = new UserModel();