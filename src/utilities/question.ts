import { TextChannel } from "discord.js";
import { BotGuildMember, BotMessage, IClient, Logger } from "..";
import { EventStrings } from "./logging/event-strings";

export default class Question
{
    private queryStr: string
    private channel: TextChannel

    public async send(): Promise<BotMessage>
    {
        return new Promise<BotMessage>(async (resolve, reject) =>
        {
            let timeout: NodeJS.Timer | null

            let resolver: (msg: BotMessage) => void
            resolver = msg =>
            {
                if (!this.askee || msg.member.id === this.askee.id)
                {
                    if (timeout)
                        clearTimeout(timeout)
                    this.client.onMessage.unsub(resolver)
                    resolve(msg)
                }
            }

            const timeoutRejecter = () =>
            {
                this.client.onMessage.unsub(resolver)
                reject(QuestionRejectionReason.ResponseTimeout)
            }

            timeout = setTimeout(timeoutRejecter, this.client.config.askTimeoutMs || 3000)
            this.client.onMessage.sub(resolver)

            try
            {
                await this.channel.send(this.queryStr)
            }
            catch (e)
            {
                Logger.debugLogError(`Failed to send question to channel ${this.channelID}`, e)
                Logger.logEvent("REMOVE THIS", EventStrings.MessageSendError)
                if (timeout)
                    clearTimeout(timeout)
                this.client.onMessage.unsub(resolver)
                reject(QuestionRejectionReason.ChannelSendError)
            }
        })
    }

    constructor(
        private client: IClient,
        public readonly channelID: string,
        public readonly query: string,
        public readonly askee?: BotGuildMember,
        public readonly pingAskee: boolean = false)
    {
        this.queryStr = query
        if (this.askee && this.pingAskee)
            this.queryStr = `${this.askee.toString()} ` + this.queryStr

        this.channel = this.client.channels.get(this.channelID) as TextChannel
    }
}

export enum QuestionRejectionReason
{
    ResponseTimeout,
    ChannelSendError,
}