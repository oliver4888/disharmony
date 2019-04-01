import { PermissionLevel } from "../../commands/command";
import { GuildMember } from "discord.js";
import Serializable from "../serializable";

export default class BotGuildMember extends Serializable
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
        private guildMember: GuildMember)
    {
        super()
    }
}