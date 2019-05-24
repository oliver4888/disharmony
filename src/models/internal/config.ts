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
    askTimeoutMs: number

    /** Configuration details for the heartbeat feature */
    heartbeat?: HeartbeatConfig

    /** Configuration object for the chosen database client; defaults will be used if not provided */
    dbClientConfig?: NedbClientConfig | MongoClientConfig
}