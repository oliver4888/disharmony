import Serializable from "../serializable";

export default class Config extends Serializable
{
    [index: string]: any
    public readonly id: string = "config"
    public askTimeoutMs: number
}