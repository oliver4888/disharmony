import { Collection, Db, MongoClient as MongoClientActual } from "mongodb"
import { Logger } from "..";
import { MongoClientConfig } from "../models/internal/config";
import { CriticalError, IDbClient } from "./db-client"

export default class MongoClient implements IDbClient
{
    private connectionPromise: Promise<void>
    private reconnectFailTimeout: NodeJS.Timeout | null
    private connectionString: string
    private client: MongoClientActual
    private db: Db

    public isMongo = true
    public get isReconnecting() { return !this.reconnectFailTimeout }

    public async updateOne(collectionName: string, query: any, update: any): Promise<void>
    {
        await (await this.getCollection(collectionName))
            .updateOne(query, update)
    }

    public async insertOne(collectionName: string, record: any): Promise<void>
    {
        await (await this.getCollection(collectionName))
            .insertOne(record)
    }

    public async findOne(collectionName: string, query: any)
    {
        return (await this.getCollection(collectionName))
            .findOne(query)
    }

    public async deleteOne(collectionName: string, query: any)
    {
        await (await this.getCollection(collectionName))
            .deleteOne(query)
    }

    public async replaceOne(collectionName: string, query: any, record: any)
    {
        await (await this.getCollection(collectionName))
            .replaceOne(query, record)
    }

    public async getCollection(collectionName: string): Promise<Collection>
    {
        await this.connectionPromise
        return this.db.collection(collectionName)
    }

    private async connectDb()
    {
        /* Don't buffer entries during downtime as if the database is down we will present a "try again soon"
           message to the user. It would be confusing if their change then did actually go through. */
        this.client = await MongoClientActual.connect(this.connectionString, {
            useNewUrlParser: true,
            autoReconnect: true,
            reconnectTries: this.mongoClientConfig.reconnectTries,
            reconnectInterval: this.mongoClientConfig.reconnectInterval,
            bufferMaxEntries: 0,
        })
        this.db = this.client.db()
        this.db.on("close", this.onClose.bind(this))
        this.db.on("reconnect", this.onReconnect.bind(this))
    }

    private onClose(err?: Error)
    {
        Logger.consoleLogError(`MongoDB connection lost`, err)
        const onReconnectFail = () => this.onCriticalError(CriticalError.ReconnectFail)
        this.reconnectFailTimeout = setTimeout(onReconnectFail, this.mongoClientConfig.reconnectInterval * this.mongoClientConfig.reconnectTries)
    }

    private onReconnect()
    {
        Logger.consoleLog("MongoDB connection re-established")
        if (this.reconnectFailTimeout)
            clearTimeout(this.reconnectFailTimeout)
        this.reconnectFailTimeout = null
    }

    constructor(
        connectionString: string,
        private onCriticalError: (err: CriticalError) => void,
        private mongoClientConfig: MongoClientConfig = { reconnectInterval: 1000, reconnectTries: 30 },
    )
    {
        this.connectionString = connectionString
        this.connectionPromise = this.connectDb().catch(err => { throw new Error("Failed to connect to database" + err ? err.message || err : "") })
    }
}