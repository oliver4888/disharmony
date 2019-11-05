import { Attachment, TextChannel } from "discord.js"
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
        await Logger.debugLog("Beginning iteration of pending data ports")

        const pendingPorts = new PendingDataPorts()
        await pendingPorts.loadDocument()

        if (pendingPorts.allPending.length === 0)
        {
            await Logger.debugLog("No pending data ports found")
        }

        for (const pendingPort of pendingPorts.allPending)
        {
            await new Promise(resolve => setTimeout(resolve, 500))

            try
            {
                await this.processDataPortForPendingEntry(pendingPort)
            }
            catch (err)
            {
                await Logger.debugLogError(`Error processing data port for member ${pendingPort.memberId} in guild ${pendingPort.guildId}`)
            }
        }

        await pendingPorts.deleteRecord()
        await Logger.debugLog("Finished iterating pending data ports")
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

        const channel = guild.djs.channels.get(pendingPort.channelId) as TextChannel

        // Process the import or export
        let filePath: string
        if (pendingPort.isImport && pendingPort.url)
            filePath = await this.processImport(pendingPort, guild, channel)
        else
            filePath = await this.processExport(pendingPort, guild, channel)

        if (filePath)
            await fsPromises.unlink(filePath)
    }

    private async processImport(pendingPort: PendingDataPort, guild: DisharmonyGuild, channel: TextChannel): Promise<string>
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
            await Logger.debugLogError(`Error piping response to file when downloading import for guild ${pendingPort.guildId} from url ${pendingPort.url!}`, err)
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
            await Logger.debugLogError(`Failed to load JSON data from file ${filePath}`, err)
            return ""
        }

        // Validate the data
        if (!data._id)
            return ""

        // Create a new Guild instance
        const document = new DisharmonyGuild(guild.djs)
        document.loadRecord(data)

        // Write the new entry to the database
        await document.save()

        try
        {
            await channel.send(`<@${pendingPort.memberId}> Your data import is complete!`)
        }
        catch (err)
        {
            Logger.debugLogError(`Error sending import confirmation message for guild ${pendingPort.guildId}`, err)
        }

        return filePath
    }

    private async processExport(pendingPort: PendingDataPort, guild: DisharmonyGuild, channel: TextChannel): Promise<string>
    {
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
            await channel.send(`<@${pendingPort.memberId}> Here is your JSON data export file`, attachment)
        }
        catch (err)
        {
            Logger.debugLogError(`Error uploading export file to channel ${pendingPort.channelId} in guild ${pendingPort.guildId}`, err)
        }

        return fileName
    }
}

if (!module.parent)
    WorkerAction.bootstrapWorkerModule(DataPortProcessor)