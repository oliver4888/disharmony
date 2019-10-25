import { Attachment } from "discord.js"
import { promises as fs } from "fs"
import { DisharmonyGuild, Logger } from ".."
import PendingDataPorts, { PendingDataPort } from "../models/internal/pending-data-ports"
import WorkerAction from "./worker-action"

export default class DataPortProcessor extends WorkerAction
{
    /** @override */
    public async invoke()
    {
        await Logger.debugLog("Beginning iteration of pending exports")

        const pendingPorts = new PendingDataPorts()
        await pendingPorts.loadDocument()

        for (const pendingPort of pendingPorts.allPending)
            await this.processDataPortForPendingEntry(pendingPort)

        await pendingPorts.deleteRecord()
        await Logger.debugLog("Finished iterating pending exports")
    }

    public async processDataPortForPendingEntry(pendingPort: PendingDataPort)
    {
        // Fetch data for this guild
        const djsGuild = this.client.djs.guilds.get(pendingPort.guildId)

        if (!djsGuild)
            return

        const guild = new DisharmonyGuild(djsGuild)
        const isMemberStillInGuild = guild.djs.members.has(pendingPort.memberId)

        if (!isMemberStillInGuild)
            return

        await guild.loadDocument()

        if (pendingPort.isImport)
            await this.processImport()
        else
            await this.processExport(guild, pendingPort)
    }

    private async processImport()
    {
        // Download the file (or 'load' it if already downloaded)

        // Create a new Guild database entry

        // Write the new entry to the database

        // Handle overwrites of existing data

        // Delete JSON file
    }

    private async processExport(guild: DisharmonyGuild, pendingPort: PendingDataPort)
    {
        const djsMember = guild.djs.members.get(pendingPort.memberId)

        const exportJson = guild.getExportJson()

        // Generate file containing JSON
        const dir = ".exports"
        await fs.mkdir(dir, { recursive: true })
        const fileName = `${dir}/${pendingPort.guildId}-${pendingPort.memberId}.json`
        await fs.writeFile(fileName, exportJson)

        // Send JSON file to member
        const attachment = new Attachment(fileName, `${pendingPort.guildId}.json`)

        try
        {
            await djsMember!.send(attachment)
        }
        catch (err)
        {
            Logger.debugLogError(`Error sending export for guild ${pendingPort.guildId} to member ${pendingPort.memberId}`, err)
        }

        // TODO Delete JSON file when done
    }
}

WorkerAction.bootstrapModuleIfInWorker(DataPortProcessor)