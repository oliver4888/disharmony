import { Channel as DjsChannel, Message as DjsMessage } from "discord.js"
import * as RequestPromise from "request-promise-native"
import { ISimpleEvent, SignalDispatcher, SimpleEventDispatcher } from "strongly-typed-events"
import { Logger } from "..";
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

type MessageConstructor<TMessage extends BotMessage> = new (djsMessage: DjsMessage) => TMessage

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

        if (this.config.heartbeat)
            this.setHeartbeatInterval()
    }

    public dispatchMessage(message: TMessage)
    {
        this.onMessage.dispatch(message)
    }

    private setHeartbeatInterval()
    {
        const interval = this.config.heartbeat!.intervalSec * 1000
        this.sendHeartbeat(true)
            .then(() => setInterval(this.sendHeartbeat.bind(this), interval))
            .catch(() => Logger.debugLogError("Error sending initial heartbeat, interval setup abandoned"))
    }

    private async sendHeartbeat(rethrow?: boolean)
    {
        try
        {
            await RequestPromise.get(this.config.heartbeat!.url)
        }
        catch (err)
        {
            Logger.debugLogError("Error sending heartbeat", err)

            if (rethrow)
                throw err
        }
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