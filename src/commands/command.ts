import { Client } from "../core/client"
import DisharmonyMessage from "../models/discord/disharmony-message"

// Allow any type messages so implementers can override Message as for some reason derived types aren't allowed
type InvokeFunc = (params: string[], message: DisharmonyMessage | any, client: Client) => Promise<string | void>

export enum PermissionLevel {
    Anyone = 0,
    Admin = 1,
    HostOwner = 2,
}

export default class Command {
    constructor(
        public syntax: string,
        public description: string,
        public permissionLevel: PermissionLevel,
        public invoke: InvokeFunc,
        public hidden: boolean = false) { }
}