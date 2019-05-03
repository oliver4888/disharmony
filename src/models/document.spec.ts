import { Test, AsyncTest, Expect, Setup } from "alsatian"
import { Mock, It, Times, IMock } from "typemoq"
import { IDbClient } from "../database/db-client";
import Document from "./document";

export class DocumentTests
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
        class Derived extends Document
        {
            constructor()
            {
                super("id", dbClientObject)
                this.record = { a: 1 }
            }
        }

        //ACT
        new Derived().save()

        //ASSERT
        this.dbClient.verify(x => x.replaceOne("Derived", { _id: "id" }, { _id: "id", a: 1 }), Times.once())
    }

    @Test()
    public db_client_receives_delete_when_serializable_delete()
    {
        //ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Document
        {
            constructor()
            {
                super("id", dbClientObject)
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
        class Derived extends Document
        {
            get exposedRecord() { return this.record }
            constructor() { super("id", dbClientObject) }
        }

        this.dbClient
            .setup(x => x.findOne("Derived", It.isAny()))
            .returns(() => Promise.resolve({ a: 1 }))

        //ACT
        const sut = new Derived()
        await sut.loadDocument()

        //ASSERT
        Expect(sut.exposedRecord).toEqual({ a: 1 })
    }

    @AsyncTest()
    public async load_document_throws_if_error_returned_when_serializable_loads_record()
    {
        //ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Document
        {
            get exposedRecord() { return this.record }
            constructor() { super("id", dbClientObject) }
        }

        this.dbClient
            .setup(x => x.findOne("Derived", It.isAny()))
            .returns(() => Promise.reject("error"))

        //ACT
        const sut = new Derived()

        //ASSERT
        await Expect(async () => await sut.loadDocument()).toThrowAsync()
    }
}