import { Guild as DjsGuild } from "discord.js"
import Serializable from "../serializable";
import BotGuildMember from "./guild-member";

export default class BotGuild extends Serializable
{
    public readonly me: BotGuildMember

    get commandPrefix() { return this.record.commandPrefix }
    set commandPrefix(val: string) { this.record.commandPrefix = val }

    constructor(
        private readonly djsGuild: DjsGuild)
    {
        super()
        this.me = new BotGuildMember(this.djsGuild.me)
    }
}