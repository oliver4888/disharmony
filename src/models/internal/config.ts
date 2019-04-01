import Document from "../document"

export default class Config extends Document
{
    [index: string]: any
    public readonly id: string = "config"
    public askTimeoutMs: number
}