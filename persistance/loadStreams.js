const { Transform } = require("stream");

function transformToCSV() {
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
    flush(cb) {
      const columns = 'country,kind,year,amount\n'
      const content =  columns + receivedRecords.map(record => {
        return [record.country, record.kind, record.year, record.amount].join(',')
      }).join('\n')
      cb(null, content)
    }
  })
}

module.exports = {
  transformToCSV
}