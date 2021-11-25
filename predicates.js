function byKind(kind) {
  return registry => registry.kind.toLowerCase().includes(kind.toLowerCase())
}

function byKinds(kinds) {
  return registry => kinds.some(kind => registry.kind.toLowerCase().includes(kind.toLowerCase()))
}

module.exports = {
  byKind,
  byKinds
}