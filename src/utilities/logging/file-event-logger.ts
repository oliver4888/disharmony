import * as SimpleFileWriter from "simple-file-writer"
import EventLogger from "./event-logger";

export default class FileEventLogger implements EventLogger
{
    private logWriter: SimpleFileWriter

    public logEvent(category: string, action: string, parameters: any): Promise<void>
    {
        const logStr = JSON.stringify({ category, action, parameters })
        return new Promise(resolve => this.logWriter.write(logStr, resolve))
    }

    constructor(path: string)
    {
        this.logWriter = new SimpleFileWriter(path)
    }
}