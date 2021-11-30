/**
 * We will get the next information
 * - Production by every type a year
 * - Imports
 * - Exports
 * - Total Production by year
 * - Total consumption by year
 */
const { createReadStream, createWriteStream } = require('fs')
const { promisify } = require('util')
const { pipeline: pipelineGenerator } = require('stream');
const { parse } = require('csv-parse');
const pipe = require('multipipe')
const { mapToProductionInfo, filterAndGroup } = require('./transform');
const { byKind, byKinds } = require('./predicates');
const { transformToCSV } = require('./persistance/loadStreams');

const pipeline = promisify(pipelineGenerator)
// Constants
const PRODUCTION_KINDS = ['From combustible fuels', 'Hydro', 'Solar', 'Wind']

// Stream filters
const productionKindsRegistries = filterAndGroup(byKinds(PRODUCTION_KINDS));
const importsRegistries = filterAndGroup(byKind('imports'));
const exportRegistries = filterAndGroup(byKind('export'));
const grossDemandRegistries = filterAndGroup(byKind('gross demand'));
const grossProductionRegistries = filterAndGroup(byKind('gross production'));

(async () => {
  const extractEnergyInformation = (transformStream, csvOutput) => {
    const csvParser = parse({ delimiter: ',' })
    const loadCSVInformation = pipe(createReadStream('energy.csv'), csvParser, mapToProductionInfo());

    return pipeline(loadCSVInformation, transformStream, transformToCSV(), createWriteStream(csvOutput))
  }
  
  await Promise.all([
    extractEnergyInformation(importsRegistries, 'output/imports.csv'),
    extractEnergyInformation(exportRegistries, 'output/exports.csv'),
    extractEnergyInformation(grossDemandRegistries, 'output/totalconsumption.csv'),
    extractEnergyInformation(grossProductionRegistries, 'output/totalproduction.csv'),
    extractEnergyInformation(productionKindsRegistries, 'output/productionkinds.csv')
  ])
})()
