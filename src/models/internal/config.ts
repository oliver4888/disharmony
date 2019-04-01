import Document from "../document"

export default class Config extends Document
{
    [index: string]: any
    public get askTimeoutMs() { return this.record.askTimeoutMs }
    public set askTimeoutMs(value: number) { this.record.askTimeoutMs = value }
}