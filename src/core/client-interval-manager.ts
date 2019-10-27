import { resolve } from "path"
import requestPromise = require("request-promise-native")
import { IClient, Logger } from ".."
import { isDbLocal } from "../utilities/load-configuration"
import { EventStrings } from "../utilities/logging/event-strings"
import { invokeWorkerAction } from "../utilities/worker-action"

export default class ClientIntervalManager
{
    private heartbeatInterval: NodeJS.Timeout
    private exportInterval: NodeJS.Timeout

    /** Use setInterval to start various callback intervals */
    public setIntervalCallbacks()
    {
        if (this.client.config.heartbeat)
            this.setHeartbeatInterval()

        this.setMemoryMeasureInterval()
        this.setExportGenerationInterval()
    }

    /** Clear any intervals who's functionality requires a Discord connection */
    public clearConnectionDependentIntervals()
    {
        if (this.heartbeatInterval)
            clearInterval(this.heartbeatInterval)

        if (this.exportInterval)
            clearInterval(this.exportInterval)
    }

    private setHeartbeatInterval()
    {
        const intervalMs = this.client.config.heartbeat!.intervalSec * 1000
        this.sendHeartbeat(true)
            .then(() => this.heartbeatInterval = setInterval(() => this.sendHeartbeat.bind(this)(), intervalMs))
            .catch(() => Logger.debugLogError("Error sending initial heartbeat, interval setup abandoned"))
    }

    private setMemoryMeasureInterval()
    {
        const intervalMs = (this.client.config.memoryMeasureIntervalSec || 600) * 1000
        setInterval(Logger.logEvent, intervalMs, EventStrings.MemoryMeasured, process.memoryUsage())
    }

    private setExportGenerationInterval()
    {
        this.exportInterval = setInterval(this.invokeExportGenerator.bind(this), /* 60 * 60 */ 5 * 1000)
    }

    /** Send the heartbeat HTTP request
     * @param rethrow Whether to rethrow any caught errors
     */
    private async sendHeartbeat(rethrow?: boolean)
    {
        try
        {
            await requestPromise.get(this.client.config.heartbeat!.url)
        }
        catch (err)
        {
            Logger.debugLogError("Error sending heartbeat", err)
            Logger.logEvent(EventStrings.SendHeartbeatError)

            if (rethrow)
                throw err
        }
    }

    private async invokeExportGenerator(): Promise<void>
    {
        return invokeWorkerAction(
            resolve(__dirname, "../utilities/data-port-processor"),
            isDbLocal(this.client.config.dbConnectionString),
            this.client)
    }

    constructor(
        private client: IClient,
    ) { }
}