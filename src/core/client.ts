import { Channel as DjsChannel, GuildMember as DjsGuildMember, Message as DjsMessage, GuildMember, VoiceState } from "discord.js"
import { ISimpleEvent, SignalDispatcher, SimpleEventDispatcher } from "strongly-typed-events"
import { DisharmonyGuild, Logger } from ".."
import Command from "../commands/command"
import inbuiltCommands from "../inbuilt-commands"
import DisharmonyGuildMember from "../models/discord/disharmony-guild-member"
import DisharmonyMessage from "../models/discord/disharmony-message"
import Config from "../models/internal/config"
import Stats from "../models/internal/stats"
import { EventStrings } from "../utilities/logging/event-strings"
import ClientIntervalManager from "./client-interval-manager"
import handleMessage from "./handle-message"
import LiteDisharmonyClient, { LiteClient } from "./lite-client"

export interface Client extends LiteClient {
    readonly commands: Command[]
    readonly channels: Map<string, DjsChannel>
    readonly onMessage: ISimpleEvent<DisharmonyMessage>
    stats: Stats
}

type MessageConstructor<TMessage extends DisharmonyMessage> = new (djsMessage: DjsMessage) => TMessage

export default class DisharmonyClient<
    TMessage extends DisharmonyMessage = DisharmonyMessage,
    // This has the _underscore prefix as it is not yet used; may be needed in future so including in 2.0 as it's a breaking addition
    _TGuild extends DisharmonyGuild = DisharmonyGuild,
    TGuildMember extends DisharmonyGuildMember = DisharmonyGuildMember,
    TConfig extends Config = Config,
    > extends LiteDisharmonyClient implements Client {
    private intervalManager: ClientIntervalManager

    public readonly onBeforeLogin = new SignalDispatcher()
    public readonly onReady = new SignalDispatcher()
    public readonly onMessage = new SimpleEventDispatcher<TMessage>()
    public readonly onVoiceStateUpdate = new SimpleEventDispatcher<{ oldState: VoiceState, newState: VoiceState }>()

    public commands: Command[]
    public stats: Stats

    public get channels(): Map<string, DjsChannel> { return this.djs.channels.cache }

    public async login(token: string) {
        await super.login(token)
        this.intervalManager.setIntervalCallbacks()

        if (this.config.playingStatusString)
            await this.djs.user?.setPresence({ activity: { name: this.config.playingStatusString } })
    }

    public async destroy() {
        this.intervalManager.clearConnectionDependentIntervals()
        await super.destroy()
    }

    public dispatchMessage(message: TMessage) {
        this.onMessage.dispatch(message)
    }

    private dispatchVoiceStateUpdateIfPermitted(oldState: VoiceState, newState: VoiceState) {
        const voiceChannel = (newState.channel || oldState.channel)

        // Sometimes this is undefined, no idea why
        if (!voiceChannel)
            return

        const botPerms = voiceChannel.permissionsFor(voiceChannel.guild.me as GuildMember)

        // Solve the issue where Discord sends voice state update events even when a voice channel is hidden from the bot
        if (botPerms && botPerms.has("VIEW_CHANNEL"))
            this.onVoiceStateUpdate.dispatch({ oldState: oldState, newState: newState })
    }

    constructor(
        commands: Command[],
        public config: TConfig,
        public messageCtor: MessageConstructor<TMessage> = DisharmonyMessage as any,
        public guildMemberCtor: new (djsGuildMember: DjsGuildMember) => TGuildMember = DisharmonyGuildMember as any,
    ) {
        super(config)

        this.djs.on("ready", () => this.onReady.dispatch())
        this.djs.on("message", dMsg => handleMessage(this, dMsg))
        this.djs.on("guildCreate", guild => Logger.logEvent(EventStrings.GuildAdd, { guildId: guild.id }))
        this.djs.on("voiceStateUpdate", this.dispatchVoiceStateUpdateIfPermitted)

        this.commands = commands.concat(inbuiltCommands)
        this.stats = new Stats(this.djs)
        this.intervalManager = new ClientIntervalManager(this)
    }
}
