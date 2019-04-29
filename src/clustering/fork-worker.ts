import * as Cluster from "cluster"
import { Logger } from "..";

export default function (modulePath: string, token: string, dbConnectionString: string)
{
    Cluster.setupMaster({
        exec: modulePath,
        args: [token, dbConnectionString]
    })
    const worker = Cluster.fork()
    addKillAndExitHooks(worker)
    Logger.debugLog(`Spawned worker process ${worker.process.pid} with module path ${modulePath}`)
    return worker
}

function addKillAndExitHooks(worker: Cluster.Worker)
{
    const killWorker = () => worker.kill()
    process.on("exit", killWorker)
    process.on("SIGINT", killWorker)
    process.on("SIGTERM", killWorker)

    worker.on("exit", () =>
    {
        Logger.debugLog(`Worker process ${worker.process.pid} exited`)
        process.off("exit", killWorker)
        process.off("SIGINT", killWorker)
        process.off("SIGTERM", killWorker)
    })
}