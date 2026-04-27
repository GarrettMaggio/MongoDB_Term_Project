const DataContext = require('../data/datacontext');

class ActivityModel {

    async logActivity(type, topicId, userId) {
    
    }

    async getActivityLog() {
        const activityLog = await DataContext.GetActivityLog();
        return activityLog.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
    }

}
module.exports = new ActivityModel();
