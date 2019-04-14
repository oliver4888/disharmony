import { Guild as DjsGuild } from "discord.js"
import Document from "../document";
import BotGuildMember from "./guild-member";
import IDjsExtension from "./djs-extension";

export default class BotGuild extends Document implements IDjsExtension<DjsGuild>
{
    public readonly me: BotGuildMember

    public get name() { return this.djs.name }
    public get commandPrefix() { return this.record.commandPrefix }

    constructor(
        public readonly djs: DjsGuild)
    {
        super(djs.id)
        this.me = new BotGuildMember(djs.me)
    }
}