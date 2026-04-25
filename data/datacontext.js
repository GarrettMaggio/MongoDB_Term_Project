const DatabaseSingleton = require('../config/databaseSingleton');

async function getDatabase() {
  return await DatabaseSingleton.getInstance();
}

class DataContext {

    static async CreateUser(username, password, displayName) {
        const db = await getDatabase();
        const user = {username, password, displayName};
        const result = await db.collection('Users').insertOne(user);
        console.log('Inserted user with ID:', result.insertedId);
        console.log('User data:', user);
        return {
            _id: result.insertedId,
            ...user
        };
    }

    static async CreateTopic(name, description) {
        const db = await getDatabase();
    }

    static async CreateSubscription(userId, topicId) {
        const db = await getDatabase();
        console.log("Inside CreateSubscription of DataContext");
        const subscription = { userId, topicId };
        const result = await db.collection('Subscriptions').insertOne(subscription);
        console.log('Inserted subscription with ID:', result.insertedId);
        console.log('Subscription data:', subscription);
        return {
            _id: result.insertedId,
            ...subscription
        };
    }

    static async CreateStat(type, topicId, userId) {
        const db = await getDatabase();
        const stat = { 
            type, topicId, userId, createdAt: new Date().toISOString()
        };
        const result = await db.collection('Stats').insertOne(stat);
        console.log('Inserted stat with ID:', result.insertedId);
        console.log('Stat data:', stat);
        return {
            _id: result.insertedId,
            ...stat
        }
    }

    static async CreatePost(topicId, userId, content) {
        const db = await getDatabase();
        const post = { topicId, userId, content, createdAt: new Date().toISOString()};
        const result = await db.collection('Posts').insertOne(post);
        console.log('Inserted post with ID:', result.insertedId);
        console.log('Post data:', post);
        return {
            _id: result.insertedId,
            ...post
        }
    }

    static async CreateActivityLog(userId, action, topicId) {
        const db = await getDatabase();
        const logEntry = { userId, action, topicId, timestamp: new Date().toISOString() };
        const result = await db.collection('ActivityLog').insertOne(logEntry);
        console.log('Inserted activity log with ID:', result.insertedId);
        console.log('Activity log data:', logEntry);
        return {
            _id: result.insertedId,
            ...logEntry
        }
    }

    static async ConnectUser() {
        const db = await getDatabase();
        return db.collection('Users').find({}).toArray(); 
    }

    static async FindUserById(userId) {
        const db = await getDatabase();
        return await db.collection('Users').findOne({ _id: userId });
    }

  static async GetTopics() {
    const db = await getDatabase();
    const topics = await db.collection('Topics').find({}).toArray();

    return topics.map((topic) => ({
      ...topic,
      id: topic.id || topic._id?.toString(),
      name: topic.name || topic.title || '',
      description: topic.description || topic.summary || '',
      tags: Array.isArray(topic.tags) ? topic.tags : [],
      accessCount: topic.accessCount ?? topic.visits ?? 0,
      createdBy: topic.createdBy || null
    }));
  }

    static async GetSubscriptions() {
        const db = await getDatabase();
        const subscribedTopics = await db.collection('Subscriptions').find({}).toArray();
        return subscribedTopics.map(t => ({
            ...t,
            id: t._id.toString(),
        }));
    }

    static async FindSubscriptionsById(userId, topicId) {
        const db = await getDatabase();
        return db.collection('Subscriptions').find({ userId, topicId }).toArray();
    }

    static async DeleteSubscription(userId, topicId) {
        const db =  await getDatabase();
        return await db.collection('Subscriptions').deleteOne({ userId, topicId });
    }

    static async GetStats() {
        const db = await getDatabase();
        return db.collection('Stats').find({}).toArray();
    }

    static async UpdateStats(type, topicId, userId) {
        const db = await getDatabase();
        const filter = { type, topicId, userId };
        const update = { $set: { createdAt: new Date().toISOString() } };
        const options = { upsert: true };
        return await db.collection('Stats').updateOne(filter, update, options).toArray();
    }

    static async DeleteStat(type, topicId, userId) {
        const db = await getDatabase();
        return await db.collection('Stats').deleteOne({ type, topicId, userId }).toArray();
    }

    static async GetStatsUser(userId) {
        const db = await getDatabase();
        return await db.collection('UserStats').findOne({ userId: userId}).toArray();
    }

    static async UpdateStatsUser(userId, stats) {
        const db = await getDatabase();
        return await db.collection('UserStats').updateOne({ userId}, { $set: stats}, { upsert: true});
    }

    static async GetPosts() {
        const db = await getDatabase();
        return db.collection('Posts').find({}).toArray();
    }

    static async GetPostsByTopic(topicId, limit = 2) {
        const db = await getDatabase();
        return db.collection('Posts').find({ topicId }).sort({ createdAt: -1 }).limit(limit).toArray(); 
    }

    static async DeletePost(postId) {
        const db = await getDatabase();
        return await db.collection('Posts').deleteOne({ _id: postId });
    }


    static async GetActivityLog() {
        const db = await getDatabase();
        return db.collection('ActivityLog').find({}).toArray();
    }
    
}
module.exports = DataContext;

