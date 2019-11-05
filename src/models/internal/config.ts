/** Configuration details for the heartbeat feature */
export interface HeartbeatConfig
{
    /** URL to send the heartbeat to */
    url: string

    /** How often to send the heartbeat */
    intervalSec: number
}

export interface NedbClientConfig
{
    /** Number of database writes after which the file should be compacted */
    compactionWriteCount: number
}

export interface MongoClientConfig
{
    /** Number of times to try reconnect when disconnected from MongoDB */
    reconnectTries: number

    /** Milliseconds to wait between reconnect retries */
    reconnectInterval: number
}

export interface ComputedValues
{
    /** Whether the database is local */
    isLocalDb: boolean

    /** Path to config file on disk */
    configPath: string
}

/** Configuration properties; see also function isConfigValid in load-configuration.ts */
export default interface Config
{
    /** Connection string for the Mongo-like database to be used */
    dbConnectionString: string

    /** Discord bot application token */
    token: string

    /** Friendly name for the bot */
    serviceName: string

    /** Bitfield containing guild permissions required for the bot to be able to function properly */
    requiredPermissions: number

    /** Timeout duration to wait for a response after asking a question */
    askTimeoutMs?: number

    /** Configuration details for the heartbeat feature */
    heartbeat?: HeartbeatConfig

    /** Configuration object for the chosen database client; defaults will be used if not provided */
    dbClientConfig?: NedbClientConfig | MongoClientConfig

    /** How often to log an event with the current memory usage */
    memoryMeasureIntervalSec?: number

    /** Text to set as the 'playing' status in Discord */
    playingStatusString?: string

    /** Configuration meta-values that are computed at runtime; don't provide anything for these */
    computedValues?: ComputedValues
}