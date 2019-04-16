import getDbClient, { initialize as initializeDb, IDbClient } from "../database/db-client";
import { Client as DjsClient } from "discord.js";
import Logger from "../utilities/logger";

export interface ILightClient
{
    readonly botName: string
    readonly botId: string
    readonly dbClient: IDbClient
    initialize(token: string): Promise<void>
}

export default class LightClient implements ILightClient
{
    protected djsClient: DjsClient

    public get botId() { return /[0-9]{18}/.exec(this.djsClient.user.toString())![0] }
    public get dbClient() { return getDbClient() }

    public async initialize(token: string)
    {
        this.djsClient.on("debug", this.onDebug)

        //remove newlines from token, sometimes text editors put newlines at the start/end but this causes problems for discord.js' login
        await this.djsClient.login(token.replace(/\r?\n|\r/g, ""))
        Logger.consoleLog(`Registered bot ${this.djsClient.user.username}`)
    }

    private onDebug(msg: string)
    {
        msg = msg.replace(/Authenticated using token [^ ]+/, "Authenticated using token [redacted]")
        if (!/[Hh]eartbeat/.exec(msg)) //ignore regular heartbeat messages that would bloat the log file
            Logger.debugLog(msg)
    }

    constructor(
        public readonly botName: string,
        dbConnectionString: string = "nedb://nedb-data"
    )
    {
        this.djsClient = new DjsClient({
            messageCacheMaxSize: 16,
            disabledEvents: [
                "CHANNEL_PINS_UPDATE",
                "GUILD_BAN_ADD",
                "GUILD_BAN_REMOVE",
                "PRESENCE_UPDATE",
                "TYPING_START",
                "USER_NOTE_UPDATE",
                "USER_SETTINGS_UPDATE"
            ]
        })

        initializeDb(dbConnectionString)

        Error.stackTraceLimit = Infinity
        process.on("uncaughtException", err => Logger.debugLog(`Unhandled exception!\n${err.message}\n${err.stack}`, true))
        process.on("exit", () => Logger.debugLog("Shutdown"))
        process.on("SIGINT", () => process.exit())
    }
}