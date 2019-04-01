import { Message as DjsMessage, RichEmbed, TextChannel } from "discord.js"
import BotGuild from "./guild";
import BotGuildMember from "./guild-member";
import { IClient } from "../../client";

export default class Message
{
    readonly guild: BotGuild
    readonly member: BotGuildMember
    public get content() { return this.djsMessage.content }
    public get channelId() { return this.djsMessage.channel.id }

    public async reply(response: string | RichEmbed)
    {
        await this.djsMessage.reply(response)
    }

    public static async ask(client: IClient, channelID: string, question: string, askee?: BotGuildMember, pingAskee: boolean = false): Promise<Message>
    {
        if (askee && pingAskee)
            question = askee.toString() + " " + question

        const channel = client.channels.get(channelID) as TextChannel
        await channel.send(question)

        return new Promise<Message>((resolve) =>
        {
            let resolver: (msg: Message) => void
            resolver = msg =>
            {
                if (!askee || msg.member.id === askee.id)
                {
                    client.onMessage.unsub(resolver)
                    resolve(msg)
                }
            }
            client.onMessage.sub(resolver)
        })
    }

    constructor(
        private djsMessage: DjsMessage)
    {
        this.guild = new BotGuild(this.djsMessage.guild)
        this.member = new BotGuildMember(this.djsMessage.member)
    }
}