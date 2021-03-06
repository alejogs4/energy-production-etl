const { Transform } = require('stream')

function mapToProductionInfo() {
  return new Transform({
    objectMode: true,
    transform(record, _, cb) {
      const [
        country,
        kind,
        year,,
        amount
      ] = record
      const productionInfo = {
        country,
        kind,
        year: Number(year),
        amount: Math.floor(Number(amount))
      }

      this.push(productionInfo)
      cb()
    }
  })
}

function filterAndGroup(predicate) {
  const results = []
  return new Transform({
    objectMode: true,
    transform(record, _, cb) {
      if (predicate(record)) {
        results.push(record)
      }
      cb()
    },
    flush(cb) {
      this.push(results)
      cb()
    }
  })
}

module.exports = {
  mapToProductionInfo,
  filterAndGroup
}