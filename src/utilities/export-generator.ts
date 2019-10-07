import { LightClient, loadConfig, Logger } from ".."
import PendingExports, { PendingExport } from "../models/internal/pending-exports"

export default class ExportGenerator
{
    public async processExportsForAllPendingEntries()
    {
        await Logger.debugLog("Beginning iteration of pending exports")

        const pendingExports = new PendingExports()
        await pendingExports.loadDocument()

        for (const pendingExport of pendingExports.allPending)
            await this.processExportForPendingEntry(pendingExport)

        await Logger.debugLog("Finished iterating pending exports")
    }

    public async processExportForPendingEntry(pendingExport: PendingExport)
    {
        // Fetch data for this guild

        // Generate file containing JSON

        // Send JSON file to member

        // Handle what to do if the file is too big for Discord's upload limit
    }

    constructor(
        private client: LightClient,
    ) { }
}

/* TODO This is almost copy-pasted from Activity Monitor's InactivityManager module.
   Perhaps it would be a good idea to create a unified concept of a "forked module" or something,
   basically a base class that can bootstrap itself like this, call the main invoke method, then exit.
   It would also do the kind of rudimentary error handling seen below. */
if (!module.parent)
{
    const configPath = process.argv[2]
    const { config } = loadConfig(undefined, configPath)
    const client = new LightClient(config)
    const exportGenerator = new ExportGenerator(client)
    client.login(config.token)
        .then(async () =>
        {
            await exportGenerator.processExportsForAllPendingEntries()
            await client.destroy()
            await Logger.debugLog("Finished processing pending exports, exiting worker")
            process.exit(0)
        })
        .catch(async err =>
        {
            await Logger.debugLogError("Error running the export generator", err)
            await Logger.logEvent("ErrorStartingPendingExportGenerator")
            process.exit(1)
        })
}