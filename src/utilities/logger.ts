///<reference path="../declarations/simple-file-writer.d.ts"/>
import * as SimpleFileWriter from "simple-file-writer"

const consoleLogWriter = new SimpleFileWriter(process.cwd() + "/console.log")
const debugLogWriter = new SimpleFileWriter(process.cwd() + "/debug.log")

function doLog(message: string, error: boolean, debug: boolean)
{
    const prefix = error ? "[ERROR]" : debug ? "[DEBUG]" : "[INFO]"
    let logStr = [`[${new Date().toUTCString()}]`, prefix, message].join(" ")

    if (!debug)
        if (error)
            console.error(logStr)
        else
            console.log(logStr)

    logStr += "\n"

    if (!debug)
        consoleLogWriter.write(logStr)

    debugLogWriter.write(logStr)
}

export default {
    consoleLog: (message: string, isError: boolean = false) => doLog(message, isError, false),
    debugLog: (message: string, isError: boolean = false) => doLog(message, isError, true)
}