import { Client as DjsClient } from "discord.js"
import { Logger } from ".."
import getDbClient, { CriticalError as CriticalDbError, DbClient } from "../database/db-client"
import DjsExtensionModel from "../models/discord/djs-extension-model"
import Document from "../models/document"
import Config from "../models/internal/config"
import { ExitCodes } from "../utilities/exit-codes"

export interface LiteClient extends DjsExtensionModel<DjsClient>
{
    readonly botId: string
    readonly dbClient: DbClient
    readonly config: Config
    login(token: string): Promise<void>
}

export default class LiteDisharmonyClient implements LiteClient
{
    public djs: DjsClient

    public get botId() { return /[0-9]{18}/.exec(this.djs.user.toString())![0] }
    public get dbClient() { return Document.dbClient }

    public async login(token: string)
    {
        // Remove newlines from token, sometimes text editors put newlines at the start/end but this causes problems for discord.js' login
        await this.djs.login(token.replace(/\r?\n|\r/g, ""))
        Logger.consoleLog(`Registered bot ${this.djs.user.username}`)
        Logger.consoleLog(`You can view detailed logs in the logs/ directory`)
    }

    public async destroy()
    {
        await this.djs.destroy()
    }

    private onDebug(msg: string)
    {
        msg = msg.replace(/Authenticated using token [^ ]+/, "Authenticated using token [redacted]")
        if (!/[Hh]eartbeat/.exec(msg)) // Ignore regular heartbeat messages that would bloat the log file
            Logger.debugLog(msg)
    }

    private onCriticalDbError(error: CriticalDbError)
    {
        (Logger.consoleLogError(`Critical database error, shutting down: ${error.toString()}`) as Promise<void>)
            .catch().then(() => process.exit(ExitCodes.CriticalDatabaseError)).catch()
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

        this.djs.on("error", (err: ErrorEvent) => Logger.debugLogError("Websocket error from discord.js", err.error))
        this.djs.on("debug", this.onDebug)

        process.on("uncaughtException", async err =>
        {
            await Logger.consoleLogError("Unhandled exception!", err)
            process.exit(ExitCodes.UnhandledException)
        })
        process.on("exit", code => Logger.consoleLog("Shutdown with code " + code))
        process.on("SIGINT", () =>
        {
            this.dbClient.closeConnection()
                .then(() => process.exit(0))
                .catch(() => process.exit(ExitCodes.DatabaseCloseError))
        })
    }
}