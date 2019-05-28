import * as SimpleFileWriter from "simple-file-writer"

const consoleLogWriter: SimpleFileWriter = new SimpleFileWriter(process.cwd() + "/console.log")
const debugLogWriter: SimpleFileWriter = new SimpleFileWriter(process.cwd() + "/debug.log")

function doLog(message: string, debugOnly: boolean, error?: Error | boolean)
{
    const prefix = error ? "[ERROR]" : debugOnly ? "[DEBUG]" : "[INFO]"
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

        if (!debugOnly)
        {
            // tslint:disable-next-line: no-console
            console.log(consoleStr)
            consoleLogWriter.write(consoleStr + "\n", () => resolve())
        }
    })
}

export default {
    consoleLog: (message: string): void | Promise<void> => doLog(message, false).catch(),
    debugLog: (message: string): void | Promise<void> => doLog(message, true).catch(),
    consoleLogError: (message: string, error?: Error): void | Promise<void> => doLog(message, false, error || true).catch(),
    debugLogError: (message: string, error?: Error): void | Promise<void> => doLog(message, true, error || true).catch(),
}