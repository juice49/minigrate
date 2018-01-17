'use strict'

const sortBy = require('sort-by')

const DIRECTION_DOWN = -1
const DIRECTION_UP = 1

const up = migrate.bind(null, DIRECTION_UP)
const down = migrate.bind(null, DIRECTION_DOWN)

async function migrate (direction, {
  args = [],
  migrations = [],
  getCurrentMigration = () => {},
  setCurrentMigration = () => {}
} = {}) {
  if (![ DIRECTION_UP, DIRECTION_DOWN ].includes(direction)) {
    throw new Error('Direction is required and must be DIRECTION_UP or DIRECTION_DOWN.')
  }

  const currentMigration = await getCurrentMigration()

  for (const migration of getTargetMigrations(direction, currentMigration, migrations)) {
    const run = migration[direction]
    await run(...args)
    await setCurrentMigration(migration.name)
  }
}

function * getTargetMigrations (direction, currentMigration, migrations) {
  let targetMigration

  while (targetMigration !== null) {
    targetMigration = getTargetMigration(direction, currentMigration, migrations)
    if (targetMigration) {
      currentMigration = targetMigration.name
      yield targetMigration
    }
  }
}

function getTargetMigration (direction, currentMigration, migrations) {
  const sortedMigrations = sortMigrations(migrations)

  // TODO: Unit test me.
  const currentMigrationIndex = typeof currentMigration === 'undefined'
    ? -1
    : getMigrationByName(currentMigration, sortedMigrations)

  return sortedMigrations[currentMigrationIndex + direction] || null
}

function sortMigrations (migrations) {
  return [ ...migrations ].sort(sortBy('name'))
}

function getMigrationByName (name, migrations) {
  const index = migrations.findIndex(migration =>
    migration.name === name)

  return index === -1
    ? null
    : index
}

module.exports = {
  DIRECTION_UP,
  DIRECTION_DOWN,
  up,
  down,
  migrate,
  getTargetMigrations,
  getTargetMigration,
  sortMigrations,
  getMigrationByName
}
