import { Attachment } from "discord.js"
import { promises as fs } from "fs"
import { DisharmonyGuild, Logger } from ".."
import PendingExports, { PendingExport } from "../models/internal/pending-exports"
import WorkerAction from "./worker-action"

export default class ExportGenerator extends WorkerAction
{
    /** @override */
    public async invoke()
    {
        await Logger.debugLog("Beginning iteration of pending exports")

        const pendingExports = new PendingExports()
        await pendingExports.loadDocument()

        for (const pendingExport of pendingExports.allPending)
            await this.processExportForPendingEntry(pendingExport)

        await pendingExports.deleteRecord()
        await Logger.debugLog("Finished iterating pending exports")
    }

    public async processExportForPendingEntry(pendingExport: PendingExport)
    {
        // Fetch data for this guild
        const djsGuild = this.client.djs.guilds.get(pendingExport.guildId)

        if (!djsGuild)
            return

        const guild = new DisharmonyGuild(djsGuild)
        const djsMember = guild.djs.members.get(pendingExport.memberId)

        if (!djsMember)
            return

        await guild.loadDocument()

        const exportJson = guild.getExportJson()

        // Generate file containing JSON
        const dir = ".exports"
        await fs.mkdir(dir, { recursive: true })
        const fileName = `${dir}/${pendingExport.guildId}-${pendingExport.memberId}.json`
        await fs.writeFile(fileName, exportJson)

        // Send JSON file to member
        const attachment = new Attachment(fileName, `${pendingExport.guildId}.json`)

        try
        {
            await djsMember.send(attachment)
        }
        catch (err)
        {
            Logger.debugLogError(`Error sending export for guild ${pendingExport.guildId} to member ${pendingExport.memberId}`, err)
        }
    }
}

WorkerAction.bootstrapModuleIfInWorker(ExportGenerator)