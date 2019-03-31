import { MongoClient as MongoClientActual, Collection } from "mongodb"
import { IDbClient } from "./db-client"

export default class MongoClient implements IDbClient
{
    private connectionString: string
    public isMongo = true

    public async upsertOne(collectionName: string, query: any, record: any)
    {
        await (await this.getCollection(collectionName))
            .replaceOne(query, record, { upsert: true })
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

    public async getCollection(collectionName: string): Promise<Collection>
    {
        const client = await MongoClientActual.connect(this.connectionString, { useNewUrlParser: true })
        return client.db().collection(collectionName)
    }

    constructor(connectionString: string)
    {
        this.connectionString = connectionString
    }
}