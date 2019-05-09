interface HeartbeatConfig
{
    url: string
    intervalSec: number
}

export default interface Config
{
    dbConnectionString: string
    token: string
    heartbeat?: HeartbeatConfig
    askTimeoutMs: number // Todo: not actually used
}