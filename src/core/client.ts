import { Channel as DjsChannel, GuildMember as DjsGuildMember, Message as DjsMessage } from "discord.js"
import * as RequestPromise from "request-promise-native"
import { ISimpleEvent, SignalDispatcher, SimpleEventDispatcher } from "strongly-typed-events"
import { Logger } from "..";
import Command from "../commands/command"
import inbuiltCommands from "../inbuilt-commands"
import BotGuildMember from "../models/discord/guild-member";
import BotMessage from "../models/discord/message";
import Config from "../models/internal/config";
import Stats from "../models/internal/stats";
import logger from "../utilities/logging/logger";
import handleMessage from "./handle-message";
import LightClient, { ILightClient } from "./light-client";

export interface IClient extends ILightClient
{
    readonly commands: Command[]
    readonly channels: Map<string, DjsChannel>
    readonly onMessage: ISimpleEvent<BotMessage>
    stats: Stats
}

type MessageConstructor<TMessage extends BotMessage> = new (djsMessage: DjsMessage) => TMessage

export default class Client<
    TMessage extends BotMessage = BotMessage,
    TGuildMember extends BotGuildMember = BotGuildMember
    > extends LightClient implements IClient
{
    private heartbeatInterval: NodeJS.Timeout

    public readonly onBeforeLogin = new SignalDispatcher()
    public readonly onReady = new SignalDispatcher()
    public readonly onMessage = new SimpleEventDispatcher<TMessage>()
    public readonly onVoiceStateUpdate = new SimpleEventDispatcher<{ oldMember: TGuildMember, newMember: TGuildMember }>()

    public commands: Command[]
    public stats: Stats

    public get channels(): Map<string, DjsChannel> { return this.djs.channels }

    public async login(token: string)
    {
        await super.login(token)

        if (this.config.heartbeat)
            this.setHeartbeatInterval()
    }

    public async destroy()
    {
        if (this.heartbeatInterval)
            clearInterval(this.heartbeatInterval)
        await super.destroy()
    }

    public dispatchMessage(message: TMessage)
    {
        this.onMessage.dispatch(message)
    }

    private dispatchVoiceStateUpdateIfPermitted(oldDjsMember: DjsGuildMember, newDjsMember: DjsGuildMember)
    {
        const voiceChannel = (newDjsMember.voiceChannel || oldDjsMember.voiceChannel)
        const botPerms = voiceChannel.permissionsFor(voiceChannel.guild.me)

        if (botPerms && botPerms.has("VIEW_CHANNEL"))
            this.onVoiceStateUpdate.dispatch({ oldMember: new this.guildMemberCtor(oldDjsMember), newMember: new this.guildMemberCtor(newDjsMember) })
    }

    private setHeartbeatInterval()
    {
        const intervalMs = this.config.heartbeat!.intervalSec * 1000
        this.sendHeartbeat(true)
            .then(() => this.heartbeatInterval = setInterval(() => this.sendHeartbeat.bind(this)(), intervalMs))
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
        commands: Command[],
        config: Config,
        public messageCtor: MessageConstructor<TMessage> = BotMessage as any,
        public guildMemberCtor: new (djsGuildMember: DjsGuildMember) => TGuildMember = BotGuildMember as any,
    )
    {
        super(config)

        this.djs.on("ready", () => this.onReady.dispatch())
        this.djs.on("message", dMsg => handleMessage(this, dMsg))
        this.djs.on("guildCreate", guild => logger.consoleLog(`Added to guild ${guild.name}`))
        this.djs.on("voiceStateUpdate", this.dispatchVoiceStateUpdateIfPermitted)

        this.commands = commands.concat(inbuiltCommands)
        this.stats = new Stats(this.djs)
    }
}