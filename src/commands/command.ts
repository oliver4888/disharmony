import Message from "../models/discord/message"
import Client from "../client"

type InvokeFunc = (params: string[], message: Message, client: Client) => Promise<string | void>

export enum PermissionLevel
{
    Anyone = 0,
    Admin = 1,
    HostOwner = 2
}

export default class Command
{
    public invokeDependency?: any
    constructor(
        public name: string,
        public description: string,
        public syntax: string,
        public permissionLevel: PermissionLevel,
        public invoke: InvokeFunc) { }
}