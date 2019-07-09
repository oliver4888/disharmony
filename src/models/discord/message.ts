import { Message as DjsMessage, RichEmbed } from "discord.js"
import IDjsExtension from "./djs-extension"
import BotGuild from "./guild"
import BotGuildMember from "./guild-member"

export default class BotMessage implements IDjsExtension<DjsMessage>
{
    public readonly guild: BotGuild
    public readonly member: BotGuildMember
    public get content() { return this.djs.content }
    public get channelId() { return this.djs.channel.id }
    public get mentions() { return this.djs.mentions }

    public async reply(response: string | RichEmbed)
    {
        await this.djs.reply(response)
    }

    constructor(
        public readonly djs: DjsMessage)
    {
        this.guild = new BotGuild(this.djs.guild)
        this.member = new BotGuildMember(this.djs.member)
    }
}