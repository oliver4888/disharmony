// tslint:disable: no-console
import * as SimpleFileWriter from "simple-file-writer"

const consoleLogWriter = new SimpleFileWriter(process.cwd() + "/console.log")
const debugLogWriter = new SimpleFileWriter(process.cwd() + "/debug.log")

function doLog(message: string, debug: boolean, error?: Error | boolean)
{
    const prefix = error ? "[ERROR]" : debug ? "[DEBUG]" : "[INFO]"
    let logStr = [`[${process.pid}] [${new Date().toUTCString()}]`, prefix, message].join(" ")

    if (debug)
        if (error instanceof Error)
        {
            let errorString = ""
            if (error.message)
                errorString += `\n${error.message}`
            if (error.stack)
                errorString += `\n${error.stack}`
            console.error(logStr + errorString)
        }
        else
            console.log(logStr)

    logStr += "\n"

    if (!debug)
        consoleLogWriter.write(logStr)

    debugLogWriter.write(logStr)
}

export default {
    consoleLog: (message: string) => doLog(message, false),
    debugLog: (message: string) => doLog(message, true),
    consoleLogError: (message: string, error?: Error) => doLog(message, false, error || true),
    debugLogError: (message: string, error?: Error) => doLog(message, true, error || true),
}