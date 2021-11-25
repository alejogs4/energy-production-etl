/**
 * We will get the next information
 * - Production by every type a year
 * - Imports
 * - Exports
 * - Total Production by year
 * - Total consumption by year
 */
const { createReadStream } = require('fs')
const { promisify } = require('util')
const { pipeline } = require('stream');
const { parse } = require('csv-parse');
const pipe = require('multipipe')
const { mapToProductionInfo, filterAndGroup } = require('./transform');
const { byKind, byKinds } = require('./predicates');

const pipelinePromise = promisify(pipeline)
const csvParser = parse({ delimiter: ',' })

// Constants
const PRODUCTION_KINDS = ['From combustible fuels', 'Hydro', 'Solar', 'Wind']

// Stream filters
const productionKindsRegistries = filterAndGroup(byKinds(PRODUCTION_KINDS));
const importsRegistries = filterAndGroup(byKind('imports'));
const exportRegistries = filterAndGroup(byKind('export'));
const grossDemandRegistries = filterAndGroup(byKind('gross demand'));
const grossProductionRegistries = filterAndGroup(byKind('gross production'));

(async () => {
  const extractEnergyInformation = transformStream => {
    const csvMappingToProductionInfo = pipe(createReadStream('energy.csv'), csvParser, mapToProductionInfo());
    return pipelinePromise(csvMappingToProductionInfo, transformStream)
  }
  

  const energyImports = extractEnergyInformation(importsRegistries)
  const energyExports = extractEnergyInformation(exportRegistries)
  const grossDemand = extractEnergyInformation(grossDemandRegistries)
  const grossProduction = extractEnergyInformation(grossProductionRegistries)
  const productionKinds = extractEnergyInformation(productionKindsRegistries)

  await energyImports
  await energyExports
  await grossDemand
  await grossProduction
  await productionKinds
})()
