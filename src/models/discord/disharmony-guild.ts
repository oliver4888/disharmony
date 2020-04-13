import { Guild as DjsGuild, PermissionResolvable } from "discord.js"
import Document from "../document"
import DisharmonyGuildMember from "./disharmony-guild-member"
import DjsExtensionModel from "./djs-extension-model"

export default class DisharmonyGuild extends Document implements DjsExtensionModel<DjsGuild>
{
    public readonly me: DisharmonyGuildMember

    public get name() { return this.djs.name }
    public get commandPrefix() { return this.record.commandPrefix }

    /** @deprecated Use `botHasPermissions` instead */
    public get hasPermissions() { return this.botHasPermissions }

    public botHasPermissions(permissions: number): boolean {
        return (this.djs.me.permissions.missing(permissions) as PermissionResolvable[]).length === 0
    }

    public getExportJson() {
        return JSON.stringify(this.record)
    }

    constructor(
        public readonly djs: DjsGuild) {
        super(djs.id, "Guild")
        this.me = new DisharmonyGuildMember(djs.me)
    }
}