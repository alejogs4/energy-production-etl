const { promisify } = require('util')
const { Transform, pipeline } = require('stream');
const parse = require('csv-parse');
const { createReadStream, createWriteStream } = require('fs')

const pipelinePromise = promisify(pipeline)

function filterByCountry(country = '') {
  return new Transform({
    objectMode: true,
    transform(record, _, cb) {
      if (record.country === country) {
        this.push(record)
      }
      cb()
    }
  })
}

function sumCountryProfit() {
  let total = 0
  return new Transform({
    objectMode: true,
    transform(record, _, cb) {
      total += Number.parseFloat(record.profit)
      cb()
    },
    flush(cb) {
      this.push(total.toString())
      cb()
    }
  })
}


(async () => {
  const csvParser = parse({ columns: true })
  await pipelinePromise(
    createReadStream('data.csv'),
    csvParser,
    filterByCountry('Italy'),
    sumCountryProfit(),
    process
  )
})()

