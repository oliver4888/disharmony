# Changelog
## v0.7.0
### Added
- Added method to fork a new Node process with a specified module
    - Will add kill/exit hooks and do some basic logging
- Added `loadCredentials` method to load default credentials file(s)
- Added Mongo-like `updateOne` implementation
    - Previously we only ever used `replaceOne`
- Added automatic `$set` operator generation based off changes to `Document.record`
- Added `SubDocument` class for sub documents to derive from
- Added `SubDocument.getArrayProxy` method to create a Proxy to track changes to subdoc arrays
    - Modifications will be included in update `$set` operator
- Added [TSLint](https://palantir.github.io/tslint/) to project
- Added [Buildkite](https://buildkite.com/) pipeline to project

### Updated
- A database connection string is now required to create a client
- `Logger` now has explicit calls for errors, instead of a boolean parameter
- Disable fewer discord.js events; these might have been causing connection issues

### Fixed
- Fixed NeDB creating a new datastore in memory every access
- Fixed a few methods not being awaitable
- Fixed a few async methods not being awaited

## v0.6.3
### Fixed
- Fixed `onReady` event not firing

## v0.6.2
### Added
- Added various unit tests

## v0.6.1
### Fixed
- Fixed incorrect method of referencing local typings causing compilation issue for client projects

## v0.6.0
### Added
- Added `LightClient` which provides just a discord.js client and a database client
- Added `onVoiceStateUpdate` event (for [Activity Monitor](https://github.com/benji7425/discord-bot-activity-monitor))
- `BotGuildMember` class now has role managing methods
- Log messages now indicate the process ID that sent them

### Updated
- Removed [MicroJob](https://github.com/wilk/microjob) integration from last version
    - [Cluster](https://nodejs.org/api/cluster.html) seems to more suit my needs at present

### Fixed
- Fixed database serialization not invoking toRecord method

## v0.5.0
### Added
- Threaded job support via [MicroJob](https://github.com/wilk/microjob)
- A few missing type exports

### Updated
- Renamed `Message` to `BotMessage` for consistency
- TypeScript now compiles to ES2018
- Removed need for ts-node just to run tests

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