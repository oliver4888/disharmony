import { Channel as DjsChannel, Message as DjsMessage } from "discord.js"
import { ISimpleEvent, SignalDispatcher, SimpleEventDispatcher } from "strongly-typed-events"
import Command from "../commands/command"
import inbuiltCommands from "../inbuilt-commands"
import BotGuildMember from "../models/discord/guild-member";
import BotMessage from "../models/discord/message";
import Config from "../models/internal/config";
import Stats from "../models/internal/stats";
import logger from "../utilities/logger";
import handleMessage from "./handle-message";
import LightClient, { ILightClient } from "./light-client";

export interface IClient extends ILightClient
{
    readonly serviceName: string
    readonly commands: Command[]
    readonly channels: Map<string, DjsChannel>
    readonly onMessage: ISimpleEvent<BotMessage>
    stats: Stats
}

type MessageConstructor<TMessage extends BotMessage> = new(djsMessage: DjsMessage) => TMessage

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
        await super.initialize(token)

        this.djs.on("ready", () => this.onReady.dispatch())
        this.djs.on("message", dMsg => handleMessage(this, dMsg))
        this.djs.on("guildCreate", guild => logger.consoleLog(`Added to guild ${guild.name}`))
        this.djs.on("voiceStateUpdate", djsMember => this.onVoiceStateUpdate.dispatch(new BotGuildMember(djsMember)))
        this.commands = this.commands.concat(inbuiltCommands)
    }

    public dispatchMessage(message: TMessage)
    {
        this.onMessage.dispatch(message)
    }

    constructor(
        public serviceName: string,
        public commands: Command[],
        public messageCtor: MessageConstructor<TMessage>,
        public config: Config,
    )
    {
        super(config.dbConnectionString)
        this.stats = new Stats(this.djs)
    }
}