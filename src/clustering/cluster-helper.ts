import * as Cluster from "cluster"
import { Logger } from "..";

function addKillAndExitHooks(worker: Cluster.Worker)
{
    const killWorker = () => worker.kill()
    process.on("SIGINT", killWorker)
    process.on("exit", killWorker)

    worker.on("exit", () =>
    {
        Logger.debugLog(`Worker process ${worker.process.pid} exited`)
        process.off("SIGINT", killWorker)
        process.off("exit", killWorker)
    })
}

export default {
    addKillAndExitHooks
}