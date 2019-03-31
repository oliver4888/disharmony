import { Test, AsyncTest, Expect, Setup } from "alsatian"
import { Mock, It, Times, IMock } from "typemoq"
import { IDbClient } from "../database/db-client";
import Serializable from "./serializable";

export class SerializableTests
{
    public dbClient: IMock<IDbClient>

    @Setup
    public setup()
    {
        this.dbClient = Mock.ofType<IDbClient>()
    }

    @Test()
    public db_client_receives_upsert_with_record_when_serializable_save()
    {
        //ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Serializable
        {
            constructor()
            {
                super(dbClientObject)
                this.id = "id"
                this.record = { a: 1 }
            }
        }

        //ACT
        new Derived().save()

        //ASSERT
        this.dbClient.verify(x => x.upsertOne("Derived", { _id: "id" }, { a: 1 }), Times.once())
    }

    @Test()
    public db_client_receives_delete_when_serializable_delete()
    {
        //ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Serializable
        {
            constructor()
            {
                super(dbClientObject)
                this.id = "id"
                this.record = { a: 1 }
            }
        }

        //ACT
        new Derived().deleteRecord()

        //ASSERT
        this.dbClient.verify(x => x.deleteOne("Derived", { _id: "id" }), Times.once())
    }

    @AsyncTest()
    public async serializable_record_set_to_db_value_when_serializable_loads_record()
    {
        //ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Serializable
        {
            get exposedRecord() { return this.record }
            constructor() { super(dbClientObject) }
        }

        this.dbClient
            .setup(x => x.findOne("Derived", It.isAny()))
            .returns(() => Promise.resolve({ a: 1 }))

        //ACT
        const sut = new Derived()
        await sut.loadRecord("id")

        //ASSERT
        Expect(sut.exposedRecord).toEqual({ a: 1 })
    }

    @AsyncTest()
    public async serializable_record_set_to_empty_object_if_error_returned_when_serializable_loads_record()
    {
        //ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Serializable
        {
            get exposedRecord() { return this.record }
            constructor() { super(dbClientObject) }
        }

        this.dbClient
            .setup(x => x.findOne("Derived", It.isAny()))
            .returns(() => Promise.reject("error"))

        //ACT
        const sut = new Derived()
        await sut.loadRecord("id")

        //ASSERT
        Expect(sut.exposedRecord).toEqual({})
    }
}