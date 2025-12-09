class EveryMinute {
  shouldRun(lastRun, now) {
    if (!lastRun) return true;
    return now.getMinutes() !== lastRun.getMinutes() || now - lastRun >= 60000;
  }
}
class EveryHourAt {
  constructor(minute) { this.minute = minute; }
  shouldRun(lastRun, now) {
    if (!lastRun) return now.getMinutes() === this.minute;
    return now.getMinutes() === this.minute && now.getHours() !== lastRun.getHours();
  }
}
class EveryDayAt {
  constructor(hour, minute) { this.hour = hour; this.minute = minute; }
  shouldRun(lastRun, now) {
    if (!lastRun) return now.getHours() === this.hour && now.getMinutes() === this.minute;
    return now.getDate() !== lastRun.getDate() &&
           now.getHours() === this.hour &&
           now.getMinutes() === this.minute;
  }
}
class EveryWeekOn {
  constructor(dayOfWeek, hour, minute) {
    this.dayOfWeek = dayOfWeek;
    this.hour = hour;
    this.minute = minute;
  }
  shouldRun(lastRun, now) {
    if (!lastRun) return now.getDay() === this.dayOfWeek && now.getHours() === this.hour && now.getMinutes() === this.minute;
    return (now.getDay() === this.dayOfWeek &&
            now.getHours() === this.hour &&
            now.getMinutes() === this.minute &&
            now - lastRun > 24 * 3600 * 1000);
  }
}
class EveryMonthOn {
  constructor(day, hour, minute) {
    this.day = day;
    this.hour = hour;
    this.minute = minute;
  }
  shouldRun(lastRun, now) {
    if (!lastRun) return now.getDate() === this.day && now.getHours() === this.hour && now.getMinutes() === this.minute;
    return (now.getDate() === this.day &&
            now.getHours() === this.hour &&
            now.getMinutes() === this.minute &&
            (now.getMonth() !== lastRun.getMonth() || now.getFullYear() !== lastRun.getFullYear()));
  }
}

describe('Scheduler periodicities', () => {
  let scheduler;
  let mockClock;
  let callback;

  beforeEach(() => {
    callback = jest.fn();
    mockClock = { now: jest.fn() };
    scheduler = new Scheduler(mockClock);
  });

  it('should run EveryMinute task once per minute', () => {
    const periodicity = new EveryMinute();
    scheduler.setTask('minute', periodicity, callback);

    mockClock.now.mockReturnValue(new Date('2024-01-01T10:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(1);

    mockClock.now.mockReturnValue(new Date('2024-01-01T10:00:30'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(1);

    mockClock.now.mockReturnValue(new Date('2024-01-01T10:01:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should run EveryHourAt task at specified minute', () => {
    const periodicity = new EveryHourAt(15);
    scheduler.setTask('hourly', periodicity, callback);

    mockClock.now.mockReturnValue(new Date('2024-01-01T10:15:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(1);

    mockClock.now.mockReturnValue(new Date('2024-01-01T11:15:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);

    mockClock.now.mockReturnValue(new Date('2024-01-01T11:16:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should run EveryDayAt task at specified hour and minute', () => {
    const periodicity = new EveryDayAt(3, 0);
    scheduler.setTask('daily', periodicity, callback);

    mockClock.now.mockReturnValue(new Date('2024-01-01T03:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(1);

    mockClock.now.mockReturnValue(new Date('2024-01-02T03:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);

    mockClock.now.mockReturnValue(new Date('2024-01-02T03:01:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should run EveryWeekOn task at specified day, hour and minute', () => {
    const periodicity = new EveryWeekOn(1, 3, 0); 
    scheduler.setTask('weekly', periodicity, callback);

    mockClock.now.mockReturnValue(new Date('2024-01-01T03:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(1);

    mockClock.now.mockReturnValue(new Date('2024-01-08T03:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);

    mockClock.now.mockReturnValue(new Date('2024-01-09T03:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should run EveryMonthOn task at specified day, hour and minute', () => {
    const periodicity = new EveryMonthOn(15, 3, 0);
    scheduler.setTask('monthly', periodicity, callback);

    mockClock.now.mockReturnValue(new Date('2024-01-15T03:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(1);

    mockClock.now.mockReturnValue(new Date('2024-02-15T03:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);

    mockClock.now.mockReturnValue(new Date('2024-02-16T03:00:00'));
    scheduler.update();
    expect(callback).toHaveBeenCalledTimes(2);
  });
});