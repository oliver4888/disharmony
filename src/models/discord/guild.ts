import { Guild as DjsGuild } from "discord.js"
import Document from "../document";
import BotGuildMember from "./guild-member";

export default class BotGuild extends Document
{
    public readonly me: BotGuildMember

    get commandPrefix() { return this.record.commandPrefix }
    set commandPrefix(val: string) { this.record.commandPrefix = val }

    constructor(
        protected readonly djsGuild: DjsGuild)
    {
        super(djsGuild.id)
        this.me = new BotGuildMember(djsGuild.me)
    }
}