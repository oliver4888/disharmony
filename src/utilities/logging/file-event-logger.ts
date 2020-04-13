import * as SimpleFileWriter from "simple-file-writer"
import EventLogger from "./event-logger"

export default class FileEventLogger implements EventLogger {
    private logWriter: SimpleFileWriter

    public logEvent(action: string, parameters: any): Promise<void> {
        const logStr = JSON.stringify({ ts: new Date().getTime(), action, parameters }) + "\n"
        return new Promise(resolve => this.logWriter.write(logStr, resolve))
    }

    constructor(path: string) {
        this.logWriter = new SimpleFileWriter(path)
    }
}