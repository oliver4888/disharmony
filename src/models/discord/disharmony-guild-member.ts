import { GuildMember as DjsGuildMember, Role } from "discord.js"
import { PermissionLevel } from "../../commands/command"
import Document from "../document"
import DjsExtensionModel from "./djs-extension-model"

export default class DisharmonyGuildMember extends Document implements DjsExtensionModel<DjsGuildMember>
{
    public get permissions() { return this.djs.permissions }
    public get nickname() { return this.djs.nickname }
    public get username() { return this.djs.user.username }

    public addRole(snowflake: string | Role, reason?: string) { return this.djs.addRole(snowflake, reason) }
    public removeRole(snowflake: string | Role, reason?: string) { return this.djs.removeRole(snowflake, reason) }

    public getPermissionLevel(): PermissionLevel {
        if (this.id === "117966411548196870")
            return PermissionLevel.HostOwner
        else if (this.permissions.has("ADMINISTRATOR"))
            return PermissionLevel.Admin
        else
            return PermissionLevel.Anyone
    }

    public toString(): string { return this.djs.toString() }

    constructor(
        public readonly djs: DjsGuildMember) {
        super(djs.id)
    }
}