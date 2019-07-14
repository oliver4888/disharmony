# Changelog
## v1.0.2
### Fixed
- Crash when processing voice state update

## v1.0.1
### Updated
- All instances of guild/member name being logged to use their ID instead
    - Provides better privacy for users
    - Allows for name changes without making logs useless

## v1.0
### Added
- Class `Client` as an extension of discord.js' Client
    - Initialises database with provided connection string
    - Provides strongly typed events for some common Discord events
    - Invokes commands when detecting message with the correct syntax
    - Sends periodic heartbeats to a configured URL
- Class `LightClient` as a basic implementation of discord.js' Client for simple operations
- Custom command creation by creating an instance of class `Command`
- Custom command execution with extended guild/member types provided
- Suite of inbuilt commands for basic administrative functionality
    - Command 'help' returns a list of available commands
    - Command 'version' returns the implementer's package.json version number
    - Command 'stats' returns some statistics about the bot
    - Command 'reset' resets all data for the guild
- Further-extendable extension of some discord.js types with added functionality
- JSON config file support with schema validation
- Error handling for commands
- Logger module for logging errors, messages and events
    - Automatically attaches timestamp and process ID
- NoSQL database integration with MongoDB or NeDB
    - Automatically selects whether to issue 'insert', 'update' or 'replace' mutation
    - Automatically loads and saves data when a command is executed
    - Provides an easy method for loading/saving data on demand
- Helper module for NodeJS cluster integration
- Class `Question` for sending a message and awaiting an answer
- Permissions validation; commands won't be executed if the bot is missing required permissions
- [TSLint](https://palantir.github.io/tslint/)
- [Buildkite](https://buildkite.com/) pipeline