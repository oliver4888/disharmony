import { Message as DjsMessage, RichEmbed, TextChannel } from "discord.js"
import BotGuild from "./guild";
import BotGuildMember from "./guild-member";

export default class Message
{
    readonly guild: BotGuild
    readonly member: BotGuildMember
    get content() { return this.djsMessage.content }
    get channelId() { return this.djsMessage.channel.id }

    public async reply(response: string | RichEmbed)
    {
        await this.djsMessage.reply(response)
    }

    constructor(
        private djsMessage: DjsMessage)
    {
        //todo inject record
        this.guild = new BotGuild(this.djsMessage.guild)
        this.member = new BotGuildMember(this.djsMessage.member)
    }
}