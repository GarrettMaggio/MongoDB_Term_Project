const DatabaseSingleton = require('../config/databaseSingleton');
const { ObjectId } = require('mongodb');

async function getDatabase() {
  return await DatabaseSingleton.getInstance();
}

class DataContext {

    static async toObjectId(id) {
        return await typeof id === 'string' ? new ObjectId(id) : id;
    }

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

    static async CreateTopic(topic) {
        const db = await getDatabase();
        const result = await db.collection('Topics').insertOne(topic);
        console.log('Inserted topic with ID:', result.insertedId);
        console.log('Topic data:', topic);
        return {
            _id: result.insertedId,
            ...topic
        };
    }

    static async CreateSubscription(userId, topicId) {
        const db = await getDatabase();
        const topic = await db.collection('Topics').findOne({ _id: new ObjectId(topicId) });
        console.log("Inside CreateSubscription of DataContext");

        const existingSubscription = await db.collection('Subscriptions').findOne({ userId: new ObjectId(userId) , topicId: new ObjectId(topicId) });        
        if (existingSubscription) {
            console.log('Subscription already exists for userId:', userId, 'and topicId:', topicId);
            return null;
        }

        const subscription = {name: topic.name, description: topic.description, tags: topic.tags, accessCount: topic.accessCount, userId: new ObjectId(userId), topicId: new ObjectId(topicId), createdAt: new Date().toISOString()};

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
            type, name: topic.name, description: topic.description, tags: topic.tags, accessCount: topic.accessCount, topicId, userId, createdAt: new Date().toISOString()
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

    static async FindTopicsById(topicId) {
        const db = await getDatabase();
        return db.collection('Topics').find({ _id: new ObjectId(topicId) }).toArray();
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
        return db.collection('Subscriptions').find({ userId: new ObjectId(userId), topicId: new ObjectId(topicId) }).toArray();
    }

    static async GetSubscriptionsByUserId(userId) {
        const db = await getDatabase();
        return db.collection('Subscriptions').find({ userId: new ObjectId(userId) }).toArray();
    }

    static async DeleteSubscription(userId, topicId) {
        const db =  await getDatabase();
        const UID = new ObjectId(userId);
        const TID = new ObjectId(topicId);
        console.log("Inside DeleteSubscription of DataContext with userId:", {userId: UID}, "and topicId:", {topicId: TID});

        const subscription = await db.collection('Subscriptions').findOne({userId: UID, topicId: TID});
        if (!subscription) {
            console.log('No subscription found for userId:', {userId: UID});
            return null;
        }

        console.log('Deleting subscription with ID:', subscription._id);
        return await db.collection('Subscriptions').deleteOne({ _id: subscription._id  });
    }

    static async GetAccessCounts() {
    const db = await getDatabase();
    const result = await db.collection('Topics').aggregate([
        {
            $group: {
                _id: null, // Group everything into one bucket
                total: { $sum: "$accessCount" } // Sum the accessCount field
            }
        }
    ]).toArray();

    console.log('Total access count:', result[0]?.total || 0);

    return result[0]?.total || 0; // Return the total or 0 if no topics exist
}

    static async GetStats() {
        const db = await getDatabase();
        return await db.collection('Stats').find({}).toArray();
    }

    static async UpdateStats(userId, topicId) {
        const db = await getDatabase();
        const topic = await db.collection('Topics').findOne({ _id: typeof topicId === 'string' ? new ObjectId(topicId) : topicId });
        console.log("TopicId" , topicId, "UserId", userId);
        if (!topic) {
            console.log('Topic not found for topicId:', topicId);
            return null;
        }
        else {
            const filter = { userId: new ObjectId(userId), topicId: new ObjectId(topicId) };
            const update = { $set: { name: topic.name, description: topic.description, tags: topic.tags, accessCount: topic.accessCount, createdAt: new Date().toISOString() } };
            const options = { upsert: true };
            return await db.collection('Stats').updateOne(filter, update, options);
        }
    }

    static async DeleteStat(type, topicId, userId) {
        const db = await getDatabase();
        return await db.collection('Stats').deleteOne({ type, topicId, userId }).toArray();
    }

    static async GetStatsUser(userId) {
        const db = await getDatabase();
        return await db.collection('UserStats').findOne(userId).toArray();
    }

    static async UpdateStatsUser(userId, stats) {
        const db = await getDatabase();
        return await db.collection('UserStats').updateOne({ userId: new ObjectId(userId) }, { $set: stats }, { upsert: true });
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