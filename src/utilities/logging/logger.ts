import * as SimpleFileWriter from "simple-file-writer"
import EventLogger from "./event-logger";
import FileEventLogger from "./file-event-logger";

const consoleLogWriter: SimpleFileWriter = new SimpleFileWriter(process.cwd() + "/console.log")
const debugLogWriter: SimpleFileWriter = new SimpleFileWriter(process.cwd() + "/debug.log")
const eventLogger: EventLogger = new FileEventLogger(process.cwd() + "/event.log")

function logMessage(message: string, writeToConsole: boolean, prefix: string, error?: Error | boolean)
{
    const messageStr = [`[${process.pid}] [${new Date().toUTCString()}]`, prefix, message].join(" ")
    let consoleStr = messageStr, debugStr = messageStr

    if (error instanceof Error)
    {
        consoleStr += ` | ${error.message}`
        debugStr += `\n\t${error.message}\n\t${error.stack}`
    }

    return new Promise<void>(resolve =>
    {
        debugLogWriter.write(debugStr + "\n", () => resolve())

        if (writeToConsole)
        {
            // tslint:disable-next-line: no-console
            console.log(consoleStr)
            consoleLogWriter.write(consoleStr + "\n", () => resolve())
        }
    })
}

function logEvent(category: string, action: string, parameters: any): void | Promise<void>
{
    const logMessagePromise = logMessage(`${category}, ${action}`, true, "[EVENT]").catch()
    const eventLogPromise = eventLogger.logEvent(category, action, parameters)

    return Promise.all([logMessagePromise, eventLogPromise]).catch() as Promise<void>
}

export default {
    consoleLog: (message: string): void | Promise<void> => logMessage(message, true, "[INFO]").catch(),
    debugLog: (message: string): void | Promise<void> => logMessage(message, false, "[DEBUG]").catch(),
    consoleLogError: (message: string, error?: Error): void | Promise<void> => logMessage(message, true, "[ERROR]", error || true).catch(),
    debugLogError: (message: string, error?: Error): void | Promise<void> => logMessage(message, false, "[ERROR_DEBUG]", error || true).catch(),
    logEvent,
}