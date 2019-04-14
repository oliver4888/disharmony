import { Guild as DjsGuild } from "discord.js"
import Document from "../document";
import BotGuildMember from "./guild-member";

export default class BotGuild extends Document
{
    public readonly me: BotGuildMember

    public get name() { return this.djsGuild.name }
    public get commandPrefix() { return this.record.commandPrefix }

    constructor(
        protected readonly djsGuild: DjsGuild)
    {
        super(djsGuild.id)
        this.me = new BotGuildMember(djsGuild.me)
    }
}