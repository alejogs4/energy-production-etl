const client = require('./connection')
const { Transform } = require("stream");
const { queuingTask } = require('promises-fn-utils')

const insertEnergyInformationRecord =  queuingTask(function insertEnergyInformationRecord(record, collection) {
  // I'm sure there must be a better way to do this, but for now and as something will not be shipped to production it is ok
  // Besides this is my last coding task at college, so great
  return client.query(`INSERT INTO ${collection} (country, kind, year, amount) VALUES($1, $2, $3, $4)`, [
    record.country,
    record.kind,
    record.year,
    record.amount
  ])
})

function loadStream(collection) {
  let receivedRecords = []
  return new Transform({
    objectMode: true,
    transform(records, _, cb) {
      if (Array.isArray(records)) {
        receivedRecords = records
      } else {
        receivedRecords.push(records)
      }
      cb()
    },
    async flush(cb) {
      try {
        console.log(receivedRecords.length)
        const petitions = receivedRecords.map(record => insertEnergyInformationRecord(record, collection))
        await Promise.all(petitions)
        this.push(receivedRecords)
        cb()
      } catch(err) {
        console.log(err)
        cb(err)
      }
    }
  })
}

module.exports = {
  loadStream
}