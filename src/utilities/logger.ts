import * as SimpleFileWriter from "simple-file-writer"

const consoleLogWriter = new SimpleFileWriter(process.cwd() + "/console.log")
const debugLogWriter = new SimpleFileWriter(process.cwd() + "/debug.log")

async function doLog(message: string, debugOnly: boolean, error?: Error | boolean)
{
    const prefix = error ? "[ERROR]" : debugOnly ? "[DEBUG]" : "[INFO]"
    const messageStr = [`[${process.pid}] [${new Date().toUTCString()}]`, prefix, message].join(" ")
    let consoleStr = messageStr, debugStr = messageStr

    if (error instanceof Error)
    {
        consoleStr += ` | ${error.message}`
        debugStr += `\n\t${error.message}\n\t${error.stack}`
    }

    await debugLogWriter.write(debugStr + "\n")

    if (!debugOnly)
    {
        // tslint:disable-next-line: no-console
        console.log(consoleStr)
        await consoleLogWriter.write(consoleStr + "\n")
    }
}

export default {
    consoleLog: (message: string): void | Promise<void> => doLog(message, false).catch(),
    debugLog: (message: string): void | Promise<void> => doLog(message, true).catch(),
    consoleLogError: (message: string, error?: Error): void | Promise<void> => doLog(message, false, error || true).catch(),
    debugLogError: (message: string, error?: Error): void | Promise<void> => doLog(message, true, error || true).catch(),
}