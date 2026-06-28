function registerJobs() {
  if (process.env.ENABLE_CRON === 'false') {
    return
  }

  require('./autoCancelJob')
  require('./bookingDayJob')
  require('./oneHourJob')
}

module.exports = registerJobs
