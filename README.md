[![Build Status](https://badge.buildkite.com/9f0abc42bfe58917d8f746d05d2bfe27d650d3efbfa0dbb680.svg?branch=master)](https://buildkite.com/benji7425/disharmony)

[![NPM](https://nodei.co/npm/disharmony.png?compact=true)](https://nodei.co/npm/disharmony/)

# Disharmony
A Discord bot framework built on top of [discord.js](https://github.com/discordjs/discord.js) with command parsing and basic Mongo-like database integration

## Features
- Built on top of [discord.js](https://github.com/discordjs/discord.js)
- Command handling
    - Syntax parsing
    - Per-server configurable prefix
    - Permission levels
- Basic default commands
    - Help menu
    - Statistics
    - Version number
- Mongo-like database support
    - MongoDB
    - [NeDB Core](https://github.com/nedbhq/nedb-core)
- Extensible

## Use cases
- Create bots without bothering with boilerplate
- Focus on bot features rather than discord/database integrations
- Reduce the amount of similar code between bots

## Examples
- [Role Assigner](https://github.com/benji7425/discord-role-assigner)
- [RSS Fetcher](https://github.com/benji7425/discord-rss-fetcher)
- [Activity Monitor](https://github.com/benji7425/discord-activity-monitor/)

## Development
### Prerequisites
- [NodeJS v10](https://nodejs.org/en/) installed

### Setup
- `npm install` to install dependencies
- `tsc` to compile JS into dist/

### Tests
- Written in TypeScript using [Alsatian](https://github.com/alsatian-test/alsatian)
- Run with `npm test`

## CI setup
- The repository is configured for CI using [Buildkite](https://buildkite.com/)
- Pipelines are stored in [.buildkite](./buildkite) and should be loadeg using Buildkite's 'read from repository' step
- The [standard pipeline](./buildkite/pipeline.yml) deals with linting, building and running tests
- The [publish pipeline](./buildkite/publish.pipeline.yml) will publish the package to NPM when triggered
    - The Buildkite agent must have an NPM auth token set in the *NPM_AUTH_TOKEN* environment variable

- Docker and Git must both be installed on the Buildkite agent
- If running the agent on Windows, a couple of extra configuration steps need to be performed
    - The drive the Buildkite agent writes to needs to be shared with Docker
    - Git's /bin folder needs to be in the PATH
    - Git's global config option *core.autocrlf* needs to be set to *false* (as the files are used in a Linux docker image)

## Built With
- [TypeScript](https://www.typescriptlang.org/) - *language*
- [discord.js](https://github.com/discordjs/discord.js) - *Discord library*
- [NeDB Core](https://github.com/nedbhq/nedb-core) - *local database engine*
- [MongoDB](https://github.com/mongodb/node-mongodb-native) - *remote database engine*
- [Alsatian](https://github.com/alsatian-test/alsatian) - *test framework*
- [TypeMoq](https://github.com/florinn/typemoq) - *mocking library*

## Documentation
- See [docs/](./docs)

## Versioning
[SemVer](http://semver.org/) is used for versioning; view available versions on the [tags page](https://github.com/your/project/tags)

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details
