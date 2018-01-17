# Minigrate

Abstract migration library.

[![Build Status](https://travis-ci.org/juice49/minigrate.svg?branch=master)](https://travis-ci.org/juice49/minigrate)

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## How do I use it?

There is no CLI. Instead, use the Minigrate API and create migrations by hand.
Could there be a CLI someday? Sure! I just haven't had the need to make one yet.

### 1. Define some migrations

Make a file for your migration. The name should follow the format ``${timestamp}-${name}``.

`./migrations/1516226643067-create-foo-table.js`

```js
'use strict'

const { DIRECTION_UP, DIRECTION_DOWN } = require('minigrate')

module.exports = {
  name: '1516226643067-create-foo-table',
  async [DIRECTION_UP] (foo, bar) {
    // Create the foo table. I'm not your database, I don't know how.
    await mkTable('foo')
    console.log('Oh yeah, this is how args work', foo, bar)
  },
  async [DIRECTION_DOWN] (foo, bar) {
    // Remove the foo table.
    await rmTable('foo')
    console.log('Oh yeah, this is how args work', foo, bar)
  }
}
```

Create an array of all your migrations. The order isn't important, except for
readability. Minigrate will sort the migrations before running them.

`./migrations/index.js`

```js
'use strict'

module.exports = [
  require('./1516226643067-create-foo-table')
]
```

Use the Minigrate API to run migrations.

`./migrate.js`

```js
'use strict'

const { up, down } = require('minigrate')
const args = [ 'foo', 'bar' ]

migrate()

async function migrate () {
  await up({
    getCurrentMigration,
    setCurrentMigration,
    migrations,
    args
  })

  console.log('Migrated')

  await down({
    getCurrentMigration,
    setCurrentMigration,
    migrations,
    args
  })

  console.log('Reverted')
}

function getCurrentMigration () {
  // Get the name of the current migration. I dunno how, you figure that out 🤷‍.
  // You can return a promise; Minigrate will await it.
  // Return undefined if no migration has yet been run.
}

function setCurrentMigration (name) {
  // Set the name of the current migration. This is called after each successful
  // migration. You should write it to your database, or a file, or something.
  // You can return a promise; Minigrate will await it.
}
```

## Why did you make this?

I didn't really want to. First I tried
[migrate](https://www.npmjs.com/package/migrate), but it lacked a feature I
needed; the ability to pass arguments to migration functions. I forked migrate,
but I made a bit of a mess of implementing my changes.

I wrote my own because:

1. I needed to pass the database instance into migration functions via arguments.
2. I wanted a library that could work in node and on the web, which ideally
meant avoiding reading migrations from the file system.
3. Making it for the web means keeping it small.
4. How difficult can it be? 👀

## The web?

Yes. This should work on the web, however it is not currently packaged for the
web. It needs to be bundled.
