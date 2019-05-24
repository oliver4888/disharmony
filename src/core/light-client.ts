import { Client as DjsClient } from "discord.js";
import getDbClient, { CriticalError as CriticalDbError, IDbClient } from "../database/db-client";
import IDjsExtension from "../models/discord/djs-extension";
import Document from "../models/document"
import Config from "../models/internal/config";
import Logger from "../utilities/logger";

export interface ILightClient extends IDjsExtension<DjsClient>
{
    readonly botId: string
    readonly dbClient: IDbClient
    readonly config: Config
    initialize(token: string): Promise<void>
}

export default class LightClient implements ILightClient
{
    public djs: DjsClient

    public get botId() { return /[0-9]{18}/.exec(this.djs.user.toString())![0] }
    public get dbClient() { return Document.dbClient }

    public async initialize(token: string)
    {
        this.djs.on("debug", this.onDebug)

        // remove newlines from token, sometimes text editors put newlines at the start/end but this causes problems for discord.js' login
        await this.djs.login(token.replace(/\r?\n|\r/g, ""))
        Logger.consoleLog(`Registered bot ${this.djs.user.username}`)
    }

    public async destroy()
    {
        await this.djs.destroy()
    }

    private onDebug(msg: string)
    {
        msg = msg.replace(/Authenticated using token [^ ]+/, "Authenticated using token [redacted]")
        if (!/[Hh]eartbeat/.exec(msg)) // ignore regular heartbeat messages that would bloat the log file
            Logger.debugLog(msg)
    }

    private onCriticalDbError(error: CriticalDbError)
    {
        (Logger.consoleLogError(`Critical database error, shutting down: ${error.toString()}`) as Promise<void>)
            .then(() => process.exit(1)).catch(() => process.exit(1))
    }

    constructor(
        public config: Config,
    )
    {
        this.djs = new DjsClient({
            messageCacheMaxSize: 16,
            disabledEvents: ["TYPING_START"],
        })

        Document.dbClient = getDbClient(config.dbConnectionString, this.onCriticalDbError, config.dbClientConfig)

        Error.stackTraceLimit = Infinity
        process.on("uncaughtException", err => Logger.debugLogError("Unhandled exception!", err))
        process.on("exit", () => Logger.debugLog("Shutdown"))
        process.on("SIGINT", () =>
        {
            this.dbClient.closeConnection()
                .then(() => process.exit(0))
                .catch(() => process.exit(1))
        })
    }
}