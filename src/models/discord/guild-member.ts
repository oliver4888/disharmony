import { PermissionLevel } from "../../commands/command";
import { GuildMember } from "discord.js";
import Document from "../document";

export default class BotGuildMember extends Document
{
    get permissions() { return this.guildMember.permissions }
    get nickname() { return this.guildMember.nickname }
    get username() { return this.guildMember.user.username }

    public getPermissionLevel(): PermissionLevel
    {
        if (this.id === "117966411548196870")
            return PermissionLevel.HostOwner
        else if (this.permissions.has("ADMINISTRATOR"))
            return PermissionLevel.Admin
        else
            return PermissionLevel.Anyone
    }

    constructor(
        protected readonly djsGuildMember: GuildMember)
    {
        super(djsGuildMember.id)
    }
}