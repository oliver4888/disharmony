# Changelog
## v2.0.5
### Fixed
- Data port processor starting up every 5 seconds rather than every 5 minutes

## v2.0.4
### Added
- Command `export` to export guild data to a JSON file
- Command `import` to import guild data from a JSON file
- Type requirement `TGuild` to `Client` declaration
- Config option to set bot 'playing' status

### Updated
- Interface names previously using hungarian notation
- Discord-based model naming to use prefix 'Disharmony' instead of 'Bot'

### Fixed
- Function `getDbClient` rejecting connection strings with modifiers in the prefix (ie "mongodb+srv://")

### Removed
- Unnecessary and confusing `DisharmonyGuildMember.hasRole` method

## v2.0.0-v2.0.3
- Versions v2.0.0 through v2.0.3 were found to have some critical issues and are therefore deprecated

## v1.2.0
### Added
- Option to create 'hidden' commands
    - Hidden commands will behave as normal commands, but won't show up in the 'help' response

## v1.1.0
### Added
- Support for extending the `Config` interface
    - Includes support for custom schema validation
    - Exposes `.config` property on `Client`

### Updated
- Method `Guild.hasPermissions` to `Guild.botHasPermissions` to make it clearer what it's purpose actually is

### Fixed
- Occasional unhandled exception when proccessing voice eventsc

## v1.0.4
### Added
- Support for providing the Discord token and DB connection string via environment variables

### Updated
- Dependency installation to be inline with NPM best practices
- Some logging statements to properly await log completion

## v1.0.3
### Added
- Event log when guild data reset

### Updated
- Logger module to no longer print events to stdout
- Log file location to be within /logs
- Calls to `process.exit` to include a unique exit code per reason

## v1.0.2
### Fixed
- Crash when processing voice state update

## v1.0.1
### Updated
- All instances of guild/member name being logged to use their ID instead
    - Provides better privacy for users
    - Allows for name changes without making logs useless

## v1.0.0
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