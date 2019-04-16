import { Message as DjsMessage, Channel as DjsChannel } from "discord.js"
import { SimpleEventDispatcher, SignalDispatcher, ISimpleEvent } from "strongly-typed-events"
import Command from "../commands/command"
import getCommandInvoker, { RejectionReason } from "../commands/command-parser"
import inbuiltCommands from "../inbuilt-commands"
import Stats from "../models/internal/stats";
import logger from "../utilities/logger";
import BotMessage from "../models/discord/message";
import BotGuildMember from "../models/discord/guild-member";
import LightClient, { ILightClient } from "./light-client";

export interface IClient extends ILightClient
{
    readonly serviceName: string
    readonly commands: Command[]
    readonly channels: Map<string, DjsChannel>
    readonly onMessage: ISimpleEvent<BotMessage>
    stats: Stats
}

type MessageConstructor<TMessage extends BotMessage> = { new(djsMessage: DjsMessage): TMessage }

export default class Client<TMessage extends BotMessage> extends LightClient implements IClient
{
    public readonly onBeforeLogin = new SignalDispatcher()
    public readonly onReady = new SignalDispatcher()
    public readonly onMessage = new SimpleEventDispatcher<TMessage>()
    public readonly onVoiceStateUpdate = new SimpleEventDispatcher<BotGuildMember>()
    public stats: Stats

    public get channels(): Map<string, DjsChannel> { return this.djs.channels }

    public async initialize(token: string)
    {
        super.initialize(token)

        this.djs.on("message", dMsg => this.handleMessage(dMsg))
        this.djs.on("guildCreate", guild => logger.consoleLog(`Added to guild ${guild.name}`))
        this.djs.on("voiceStateUpdate", djsMember => this.onVoiceStateUpdate.dispatch(new BotGuildMember(djsMember)))
        this.commands = this.commands.concat(inbuiltCommands)
    }

    private async handleMessage(djsMessage: DjsMessage)
    {
        //ignore messages from self
        if (djsMessage.member.id === djsMessage.member.guild.me.id)
            return

        const message = new this.messageCtor(djsMessage)

        try
        {
            const commandInvoker = await getCommandInvoker(this, message)
            if (commandInvoker)
                commandInvoker(this, message).then(val =>
                {
                    if (val)
                        message.reply(val)
                })
        }
        catch (reason)
        {
            if (reason in RejectionReason)
                message.reply(getRejectionMsg(reason))
        }

        this.onMessage.dispatch(message)
    }

    constructor(
        public serviceName: string,
        public commands: Command[],
        private messageCtor: MessageConstructor<TMessage>,
        dbConnectionString?: string,
    )
    {
        super(dbConnectionString)
        this.stats = new Stats(this.djs)
    }
}

function getRejectionMsg(reason: RejectionReason)
{
    switch (reason)
    {
        case RejectionReason.MissingPermission:
            return "You do not have permission to use this command."
        case RejectionReason.IncorrectSyntax:
            return "Incorrect syntax! See correct syntax with the `help` command."
    }
}