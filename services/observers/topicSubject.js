class TopicSubject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    this.observers.push(observer);
  }

  notify(eventName, payload) {
    this.observers.forEach((observer) => observer.update(eventName, payload));
  }
}

module.exports = new TopicSubject();
