/** Configuration details for the heartbeat feature */
interface HeartbeatConfig
{
    /** URL to send the heartbeat to */
    url: string

    /** How often to send the heartbeat */
    intervalSec: number
}

export default interface Config
{
    /** Connection string for the Mongo-like database to be used */
    dbConnectionString: string

    /** Discord bot application token */
    token: string

    /** Configuration details for the heartbeat feature */
    heartbeat?: HeartbeatConfig

    /** Friendly name for the bot */
    serviceName: string

    /** Bitfield containing guild permissions required for the bot to be able to function properly */
    requiredPermissions: number

    /** Timeout duration to wait for a response after asking a question */
    askTimeoutMs: number // Todo: not actually used
}