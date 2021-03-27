import { Message as DjsMessage, RichEmbed } from "discord.js"
import DisharmonyGuild from "./disharmony-guild"
import DisharmonyGuildMember from "./disharmony-guild-member"
import DjsExtensionModel from "./djs-extension-model"

export default class DisharmonyMessage implements DjsExtensionModel<DjsMessage>
{
    public readonly guild: DisharmonyGuild
    public member: DisharmonyGuildMember
    public get content() { return this.djs.content }
    public get channelId() { return this.djs.channel.id }
    public get mentions() { return this.djs.mentions }

    public async reply(response: string | RichEmbed) {
        await this.djs.reply(response)
    }

    public async fetchMember() {
        if (this.member === undefined) {
            this.member = new DisharmonyGuildMember(await this.djs.guild.fetchMember(this.djs.author.id));
        }
    }

    constructor(
        public readonly djs: DjsMessage) {
        this.guild = new DisharmonyGuild(this.djs.guild)
    }
}