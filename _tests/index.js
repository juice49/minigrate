'use strict'

const tap = require('tap')

const {
  DIRECTION_UP,
  DIRECTION_DOWN,
  migrate,
  sortMigrations,
  getMigrationByName,
  getTargetMigrations,
  getTargetMigration
} = require('../')

const migrations = [
  {
    name: '1515885855407-foobar',
    [DIRECTION_UP] () {},
    [DIRECTION_DOWN] () {}
  },
  {
    name: '1515778613835-something',
    [DIRECTION_UP] () {},
    [DIRECTION_DOWN] () {}
  },
  {
    name: '1515620317974-something',
    [DIRECTION_UP] () {},
    [DIRECTION_DOWN] () {}
  }
]

migrate(DIRECTION_UP, {
  migrations,
  getCurrentMigration: () => '1515778613835-something'
})

tap.test('migrate', test => {
  test.rejects(migrate, 'if no direction is provided, it should throw')

  test.test(async test => {
    const ran = []

    await migrate(DIRECTION_UP, {
      migrations,
      getCurrentMigration: () => '1515620317974-something',
      setCurrentMigration: name => ran.push(name)
    })

    test.same(ran, [
      '1515778613835-something',
      '1515885855407-foobar'
    ], 'run each target migration and call setCurrentMigration each time')

    test.end()
  })

  tap.test(async test => {
    const args = [ 'foo', 'bar' ]
    let passedArgs = []

    await migrate(DIRECTION_UP, {
      migrations: [
        {
          name: '1515778613835-something',
          [DIRECTION_UP] () {},
          [DIRECTION_DOWN] () {}
        },
        {
          name: '1515885855407-foobar',
          [DIRECTION_UP] (...args) {
            passedArgs = args
          },
          [DIRECTION_DOWN] () {}
        }
      ],
      getCurrentMigration: () => '1515620317974-something',
      args
    })

    test.same(args, passedArgs, 'it should spread the args array into the run function')
  })

  test.end()
})

tap.test('sortMigrations', test => {
  const sorted = [
    {
      name: '1515620317974-something',
      [DIRECTION_UP] () {},
      [DIRECTION_DOWN] () {}
    },
    {
      name: '1515778613835-something',
      [DIRECTION_UP] () {},
      [DIRECTION_DOWN] () {}
    },
    {
      name: '1515885855407-foobar',
      [DIRECTION_UP] () {},
      [DIRECTION_DOWN] () {}
    }
  ]

  const equal = sortMigrations(migrations).every(({ name }, i) =>
    name === sorted[i].name)

  test.ok(equal, 'it should sort the migrations chronologically')
  test.end()
})

tap.test('getMigrationByName', test => {
  test.test('if there is a match', test => {
    const name = '1515620317974-something'
    const index = getMigrationByName(name, migrations)
    test.equal(index, 2, 'it should return the index of a single match')
    test.end()
  })

  test.test('if there is no match', test => {
    const name = 'the-world-is-quiet-here'
    const index = getMigrationByName(name, migrations)
    test.equal(index, null, 'it should return null')
    test.end()
  })

  test.end()
})

tap.test('getTargetMigration', test => {
  test.test('when migrating up', test => {
    const currentMigration = '1515620317974-something'
    const targetMigration = getTargetMigration(DIRECTION_UP, currentMigration, migrations)
    test.equal(targetMigration.name, '1515778613835-something', 'it should return the next migration')
    test.end()
  })

  test.test('when migrating down', test => {
    const currentMigration = '1515778613835-something'
    const targetMigration = getTargetMigration(DIRECTION_DOWN, currentMigration, migrations)
    test.equal(targetMigration.name, '1515620317974-something', 'it should return the previous migration')
    test.end()
  })

  test.test('if there is no match', test => {
    const targetMigrations = [
      getTargetMigration(DIRECTION_DOWN, '1515620317974-something', migrations),
      getTargetMigration(DIRECTION_UP, '1515885855407-foobar', migrations)
    ]

    const ok = targetMigrations.every(migration =>
      migration === null)

    test.ok(ok, 'it should return null')
    test.end()
  })

  test.end()
})

tap.test('getTargetMigrations', test => {
  test.test('when migrating up', test => {
    const currentMigration = '1515778613835-something'
    const targetMigrations = [ ...getTargetMigrations(DIRECTION_UP, currentMigration, migrations) ]
    const ok = targetMigrations[0] && targetMigrations[0].name === '1515885855407-foobar'
    test.ok(ok, 'it should yield each target migration in chronological order')
    test.end()
  })

  test.test('when migrating up', test => {
    const currentMigration = '1515778613835-something'
    const targetMigrations = [ ...getTargetMigrations(DIRECTION_DOWN, currentMigration, migrations) ]
    const ok = targetMigrations[0] && targetMigrations[0].name === '1515620317974-something'
    test.ok(ok, 'it should yield each target migration in reverse chronological order')
    test.end()
  })

  test.end()
})
