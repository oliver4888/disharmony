import { MongoClientConfig, NedbClientConfig } from "../models/internal/config"
import Logger from "../utilities/logging/logger"
import MongoClient from "./mongo-client"
import NedbClient from "./nedb-client"

export default function getDbClient(connectionString: string, onCriticalError: (err: CriticalError) => void, clientConfig?: MongoClientConfig | NedbClientConfig): DbClient
{
    const protocol = connectionString.match(/^.+:\/\//)![0]

    if (protocol)
    {
        Logger.consoleLog(`Using database protocol ${protocol}`)

        if (protocol.startsWith("mongodb"))
            return new MongoClient(connectionString, onCriticalError, clientConfig as MongoClientConfig)
        else if (protocol.startsWith("nedb"))
            return new NedbClient(connectionString)
    }

    throw new Error("Invalid connection string")
}

export interface DbClient
{
    updateOne(collectionName: string, query: any, update: any): Promise<void>
    insertOne(collectionName: string, record: any, allowBuffering?: boolean): Promise<void>
    findOne(collectionName: string, query: any, allowBuffering?: boolean): Promise<any>
    deleteOne(collectionName: string, query: any, allowBuffering?: boolean): Promise<void>
    replaceOne(collectionName: string, query: any, record: any): Promise<void>

    closeConnection(): Promise<void>

    isMongo: boolean
    isReconnecting: boolean
}

export enum CriticalError
{
    ReconnectFail = "Reconnect failure",
}