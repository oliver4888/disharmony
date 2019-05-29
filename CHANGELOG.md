# Changelog
## v0.9.2
### Fixed
- Property `isReconnecting` on `MongoClient` returning inverted value (true if not reconnecting, false if reconnecting)

## v0.9.1
### Fixed
- Exception being thrown if message member is null

## v0.9.0
### Added
- Improved error handling during command parsing and execution
    - Errors should now always be caught, and translated into a user message
    - Differentation is performed between friendly and unfriendly user error strings;  
      unfriendly errors will return generic "An unknown error occurred" message
- Schema validation for config file
    - Starting the app with an invalid config file will halt

### Fixed
- Instances where log messages wouldn't finish writing before process exit after an error
- Command parsing not allowing all whitespace types between parameters
- Command parsing not allowing more than one whitespace character between parameters
- Classes derived from `Document` not always having `toRecord` executed before saving

## v0.8.3
### Fixed
- Writes to subdocuments conflicting with array container mutation
- Direct array mutations not being written to the database

## v0.8.2
### Fixed
- Fields includud in `$set` operator not being cleared after an `insert`

## v0.8.1
### Added
- Configuration object support for Mongo and NeDB clients
- Configurable timeout to `Message.ask`

### Fixed
- MongoDB integration not reusing exising Db connection

## v0.8.0
### Added
- Configuration file support, defaults to *./config.json*
- HTTP heartbeat with configurable URL and interval
- Method to validate that the bot has necessary permissions
    - Prevents commands being run if permissions haven't been granted

### Updated
- Logger module methods are now optionally awaitable
- Method `loadCredentials` to instead be `loadConfig`

### Fixed
- TSLint misconfiguration
- Debug logged errors not including message or stack trace

## v0.7.0
### Added
- Method to fork a new Node process with a specified module
    - Will add kill/exit hooks and do some basic logging
- Method `loadCredentials` to load default credentials file(s)
- Mongo-like `updateOne` implementation
    - Previously we only ever used `replaceOne`
- Automatic `$set` operator generation based off changes to `Document.record`
- Class `SubDocument` for sub documents to derive from
- Method `SubDocument.getArrayProxy` to create a Proxy to track changes to subdoc arrays
    - Modifications will be included in update `$set` operator
- [TSLint](https://palantir.github.io/tslint/)
- [Buildkite](https://buildkite.com/) pipeline

### Updated
- Client constructor to require a database connection string
- Module `Logger` to have explicit calls for errors, instead of a boolean parameter

### Removed
- Disabled discord.js events; these might have been causing connection issues

### Fixed
- NeDB creating a new datastore in memory every access
- A few methods not being awaitable
- A few async methods not being awaited

## v0.6.3
### Fixed
- Event `onReady` not firing

## v0.6.2
### Added
- Various unit tests

## v0.6.1
### Fixed
- Incorrect method of referencing local typings causing compilation issue for client projects

## v0.6.0
### Added
- Class `LightClient` which provides just a discord.js client and a database client
- Event `onVoiceStateUpdate` (for [Activity Monitor](https://github.com/benji7425/discord-bot-activity-monitor))
- Class `BotGuildMember` now has role managing methods
- Process ID string to log messages

### Removed
- [MicroJob](https://github.com/wilk/microjob) integration from last version
    - [Cluster](https://nodejs.org/api/cluster.html) seems to more suit my needs at present

### Fixed
- Database serialization not invoking toRecord method

## v0.5.0
### Added
- Threaded job support via [MicroJob](https://github.com/wilk/microjob)
- A few missing type exports

### Updated
- Class `Message` to be named `BotMessage` for consistency
- TypeScript now compilation target to ES2018

### Removed
- Need for ts-node just to run tests

## v0.4.1
### Updated
- Various metadata updates for better NPM compatibility

## v0.4.0
### Added
- NeDB support
- MongoDB support
- Command handling
- Default commands

### v0.1-0.3
Versions v0.1 through v0.3 are considered "legacy", as most of the library was re-written for v0.4.  
You can view the legacy branch [here](https://github.com/benji7425/disharmony/tree/legacy)