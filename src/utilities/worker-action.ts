import { resolve } from "path"
import { forkWorkerClient, LiteClient, LiteDisharmonyClient, loadConfig, Logger } from ".."

/** Base class representing a module which can be easily launched in a worker module.
 *  Will automatically connect to Discord and provide a LightClient instance
 */
export default abstract class WorkerAction
{
    public static bootstrapModuleIfInWorker<T extends WorkerAction>(moduleCtor: new (client: LiteDisharmonyClient) => T)
    {
        if (!module.parent)
        {
            const configPath = process.argv[2]
            const { config } = loadConfig(undefined, configPath)
            const client = new LiteDisharmonyClient(config)
            const module = new moduleCtor(client)

            client.login(config.token)
                .then(async () =>
                {
                    await module.invoke()
                    await client.destroy()
                    await Logger.debugLog("Exiting worker")
                    process.exit(0)
                })
                .catch(async err =>
                {
                    await Logger.debugLogError("Error invoking module in worker process", err)
                    await Logger.logEvent("ErrorInWorkerModule")
                    process.exit(1)
                })
        }
    }

    /** @abstract */
    public async invoke()
    {
        return
    }

    constructor(
        protected client: LiteDisharmonyClient,
    ) { }
}

export async function invokeWorkerAction(path: string, useMainProcess: boolean, mainProcessClient: LiteClient): Promise<void>
export async function invokeWorkerAction(path: string, useMainProcess: boolean, configPath: string): Promise<void>
export async function invokeWorkerAction(path: string, useMainProcess: boolean, processArg: LiteClient | string)
{
    await Logger.debugLog(`Loading worker module in ${useMainProcess ? "main" : "worker"} process`)
    if (useMainProcess)
    {
        const moduleCtor = (await import(path)).default
        await new moduleCtor(processArg).invoke()
    }
    else
        forkWorkerClient(resolve(path), processArg as string)
}