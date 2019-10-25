import { Attachment } from "discord.js"
import { promises as fs, createWriteStream, write } from "fs"
import { DisharmonyGuild, Logger } from ".."
import PendingDataPorts, { PendingDataPort } from "../models/internal/pending-data-ports"
import WorkerAction from "./worker-action"
import * as http from "http"
import { promisify } from "typed-promisify"

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

        let filePath: string
        if (pendingPort.isImport && pendingPort.url)
            filePath = await this.processImport(pendingPort)
        else
            filePath = await this.processExport(guild, pendingPort)

        // TODO Delete filePath
    }

    private async processImport(pendingPort: PendingDataPort): Promise<string>
    {
        // Set up the file to be piped into
        const dir = ".imports"
        await fs.mkdir(dir, { recursive: true })
        const filePath = `${dir}/${pendingPort.guildId}`
        const writeStream = createWriteStream(filePath)

        const response = await new Promise<http.IncomingMessage>(resolve => http.get(pendingPort.url!, resolve))

        // Exit if response is not successful
        if (response.statusCode !== 200)
        {
            Logger.debugLogError(`Failed to fetch the import file for guild ${pendingPort.guildId} from url ${pendingPort.url!}`)
            return ""
        }

        // Pipe the response data to a file
        try
        {
            response.pipe(writeStream)
            await promisify(writeStream.close)()
        }
        catch (err)
        {
            await fs.unlink(filePath)
            await Logger.debugLogError(`Error piping response to file when downloading import for guild ${pendingPort.guildId} from url ${pendingPort.url!}`)
        }
        
        // Load the file

        // Create a new Guild database entry

        // Write the new entry to the database

        // Handle overwrites of existing data

        // Delete JSON file

        return filePath
    }

    private async processExport(guild: DisharmonyGuild, pendingPort: PendingDataPort): Promise<string>
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

        return fileName
    }
}

WorkerAction.bootstrapModuleIfInWorker(DataPortProcessor)