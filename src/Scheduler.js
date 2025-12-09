class Scheduler {
  constructor(clock) {
    this.clock = clock;
    this.tasks = new Map();
  }

  getTasks() {
    return Array.from(this.tasks.keys());
  }

  setTask(name, periodicity, callback) {
    this.tasks.set(name, {
      periodicity,
      callback,
      lastRun: null
    });
  }

  removeTask(name) {
    this.tasks.delete(name);
  }
}

module.exports = Scheduler;