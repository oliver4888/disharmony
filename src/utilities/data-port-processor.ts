import { Attachment, Guild as DjsGuild } from "discord.js"
import { createWriteStream, promises as fsPromises } from "fs"
import { IncomingMessage } from "http"
import { get as httpsGet } from "https"
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

        // Process the import or export
        let filePath: string
        if (pendingPort.isImport && pendingPort.url)
            filePath = await this.processImport(pendingPort, djsGuild)
        else
            filePath = await this.processExport(guild, pendingPort)

        if (filePath)
            await fsPromises.unlink(filePath)
    }

    private async processImport(pendingPort: PendingDataPort, djsGuild: DjsGuild): Promise<string>
    {
        // Set up the file to be piped into
        const dir = ".imports"
        await fsPromises.mkdir(dir, { recursive: true })
        const filePath = `${dir}/${pendingPort.guildId}`
        const writeStream = createWriteStream(filePath)

        const response = await new Promise<IncomingMessage>(resolve => httpsGet(pendingPort.url!, resolve))

        // Exit if response is not successful
        if (response.statusCode !== 200)
        {
            Logger.debugLogError(`Failed to fetch the import file for guild ${pendingPort.guildId} from url ${pendingPort.url!}`)
            return ""
        }

        // Pipe the response data to a file
        try
        {
            const writePromise = new Promise(resolve =>
            {
                response.pipe(writeStream)
                writeStream.on("close", resolve)
            })
            await writePromise
            writeStream.close()
        }
        catch (err)
        {
            await fsPromises.unlink(filePath)
            await Logger.debugLogError(`Error piping response to file when downloading import for guild ${pendingPort.guildId} from url ${pendingPort.url!}`)
            return ""
        }

        // Load the file
        let data: any
        try
        {
            const contents = await fsPromises.readFile(filePath, "utf8")
            data = JSON.parse(contents)
        }
        catch (err)
        {
            await Logger.debugLogError(`Failed to load JSON data from file ${filePath}`)
            return ""
        }

        // Validate the data
        if (!data._id)
            return ""

        // Create a new Guild instance
        const document = new DisharmonyGuild(djsGuild)
        document.loadRecord(data)

        // Write the new entry to the database
        await document.save() // TODO Validate that this will overwrite if record already exists

        return filePath
    }

    private async processExport(guild: DisharmonyGuild, pendingPort: PendingDataPort): Promise<string>
    {
        const djsMember = guild.djs.members.get(pendingPort.memberId)

        const exportJson = guild.getExportJson()

        // Generate file containing JSON
        const dir = ".exports"
        await fsPromises.mkdir(dir, { recursive: true })
        const fileName = `${dir}/${pendingPort.guildId}-${pendingPort.memberId}.json`
        await fsPromises.writeFile(fileName, exportJson)

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