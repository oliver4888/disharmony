import * as Datastore from "nedb-core"
import { join } from "path"
import { promisify } from "typed-promisify"
import { NedbClientConfig } from "../models/internal/config"
import Logger from "../utilities/logging/logger"
import { IDbClient } from "./db-client"

export default class NedbClient implements IDbClient
{
    private writeCount: number = 0
    private baseDir: string
    private collections: Datastore[] = new Array<Datastore>()

    public isMongo = false
    public isReconnecting = false

    public async updateOne(collectionName: string, query: any, update: any): Promise<void>
    {
        const collection = this.getCollection(collectionName)
        await promisify(collection.update, collection)(query, update, {})
        this.incrementWriteCount()
    }

    public async insertOne(collectionName: string, record: any): Promise<void>
    {
        const collection = this.getCollection(collectionName)
        await promisify(collection.insert, collection)(record)
        this.incrementWriteCount()
    }

    public async findOne(collectionName: string, query: any)
    {
        const collection = this.getCollection(collectionName)
        return promisify(collection.findOne, collection)(query)
    }

    public async deleteOne(collectionName: string, query: any)
    {
        const collection = this.getCollection(collectionName)
        await promisify(collection.remove, collection)(query)
    }

    public async replaceOne(collectionName: string, query: any, record: any)
    {
        return this.updateOne(collectionName, query, record)
    }

    public closeConnection()
    {
        return Promise.resolve()
    }

    private getCollection(name: string): Datastore
    {
        const filename = join(this.baseDir, name)
        let collection = this.collections.find(x => x.filename === filename)
        if (!collection)
        {
            collection = new Datastore({ filename, autoload: true })
            this.collections.push(collection!)
        }

        return collection!
    }

    private incrementWriteCount()
    {
        this.writeCount++

        if (this.writeCount > this.nedbClientConfig.compactionWriteCount)
        {
            for (const collection of this.collections)
                collection.persistence.compactDatafile()
            this.writeCount = 0
            Logger.debugLog("Compacted NeDB collections")
        }
    }

    constructor(
        connectionString: string,
        private nedbClientConfig: NedbClientConfig = { compactionWriteCount: 100 })
    {
        this.baseDir = /^nedb:\/\/(.+)/.exec(connectionString)![1]
    }
}
