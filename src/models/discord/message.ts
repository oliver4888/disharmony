import { Message as DjsMessage, RichEmbed, TextChannel } from "discord.js"
import { IClient } from "../../core/client";
import IDjsExtension from "./djs-extension";
import BotGuild from "./guild";
import BotGuildMember from "./guild-member";

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

    public static async ask(client: IClient, channelID: string, question: string, askee?: BotGuildMember, pingAskee: boolean = false): Promise<BotMessage>
    {
        if (askee && pingAskee)
            question = askee.toString() + " " + question

        const channel = client.channels.get(channelID) as TextChannel
        await channel.send(question)

        return new Promise<BotMessage>((resolve, reject) =>
        {
            let timeout: NodeJS.Timer | null

            let resolver: (msg: BotMessage) => void
            resolver = msg =>
            {
                if (!askee || msg.member.id === askee.id)
                {
                    if (timeout)
                        clearTimeout(timeout)
                    client.onMessage.unsub(resolver)
                    resolve(msg)
                }
            }

            const rejecter = () =>
            {
                client.onMessage.unsub(resolver)
                reject("Response timeout")
            }

            timeout = setTimeout(rejecter, client.config.askTimeoutMs || 3000)
            client.onMessage.sub(resolver)
        })
    }

    constructor(
        public readonly djs: DjsMessage)
    {
        this.guild = new BotGuild(this.djs.guild)
        this.member = new BotGuildMember(this.djs.member)
    }
}