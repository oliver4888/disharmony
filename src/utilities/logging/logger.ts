import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import * as SimpleFileWriter from "simple-file-writer"
import EventLogger from "./event-logger"
import FileEventLogger from "./file-event-logger"

const logsDir = join(process.cwd(), "logs")
if (!existsSync(logsDir))
    mkdirSync(logsDir)

const consoleLogWriter: SimpleFileWriter = new SimpleFileWriter(join(logsDir, "console.log"))
const debugLogWriter: SimpleFileWriter = new SimpleFileWriter(join(logsDir, "debug.log"))
const eventLogger: EventLogger = new FileEventLogger(join(logsDir, "event.log"))

function logMessage(message: string, writeToConsole: boolean, prefix: string, error?: Error | boolean)
{
    const messageStr = [`[${process.pid}] [${new Date().toUTCString()}]`, prefix, message].join(" ")
    let consoleStr = messageStr, debugStr = messageStr

    if (error instanceof Error)
    {
        consoleStr += ` | ${error.message}`
        debugStr += `\n\t${error.message}\n\t${error.stack}`
    }

    if (writeToConsole)
        // tslint:disable-next-line: no-console
        console.log(consoleStr)

    return new Promise<void>(async resolve =>
    {
        debugLogWriter.write(debugStr + "\n", () => resolve())

        if (writeToConsole)
            consoleLogWriter.write(consoleStr + "\n", () => resolve())
    })
}

function logEvent(action: string, parameters?: any): void | Promise<void>
{
    return eventLogger.logEvent(action, parameters)
}

export default {
    consoleLog: (message: string): void | Promise<void> => logMessage(message, true, "[INFO]").catch(),
    debugLog: (message: string): void | Promise<void> => logMessage(message, false, "[DEBUG]").catch(),
    consoleLogError: (message: string, error?: Error): void | Promise<void> => logMessage(message, true, "[ERROR]", error || true).catch(),
    debugLogError: (message: string, error?: Error): void | Promise<void> => logMessage(message, false, "[ERROR_DEBUG]", error || true).catch(),
    logEvent,
}