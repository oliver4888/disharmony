import { PermissionLevel } from "../../commands/command";
import { GuildMember } from "discord.js";
import Document from "../document";

export default class BotGuildMember extends Document
{
    public get permissions() { return this.djsGuildMember.permissions }
    public get nickname() { return this.djsGuildMember.nickname }
    public get username() { return this.djsGuildMember.user.username }

    public addRole(snowflake: string) { return this.djsGuildMember.addRole(snowflake) }
    public removeRole(snowflake: string) { return this.djsGuildMember.removeRole(snowflake) }

    public hasRole(snowflake: string): boolean
    {
        return !!this.djsGuildMember.roles.get(snowflake)
    }

    public getPermissionLevel(): PermissionLevel
    {
        if (this.id === "117966411548196870")
            return PermissionLevel.HostOwner
        else if (this.permissions.has("ADMINISTRATOR"))
            return PermissionLevel.Admin
        else
            return PermissionLevel.Anyone
    }

    public toString(): string { return this.djsGuildMember.toString() }

    constructor(
        protected readonly djsGuildMember: GuildMember)
    {
        super(djsGuildMember.id)
    }
}