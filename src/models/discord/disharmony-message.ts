import { Message as DjsMessage, RichEmbed } from "discord.js"
import DisharmonyGuild from "./disharmony-guild"
import DisharmonyGuildMember from "./disharmony-guild-member"
import DjsExtensionModel from "./djs-extension-model"

export default class DisharmonyMessage implements DjsExtensionModel<DjsMessage>
{
    public readonly guild: DisharmonyGuild
    public readonly member: DisharmonyGuildMember
    public get content() { return this.djs.content }
    public get channelId() { return this.djs.channel.id }
    public get mentions() { return this.djs.mentions }

    public async reply(response: string | RichEmbed) {
        await this.djs.reply(response)
    }

    constructor(
        public readonly djs: DjsMessage) {
        this.guild = new DisharmonyGuild(this.djs.guild)
        this.member = new DisharmonyGuildMember(this.djs.member)
    }
}