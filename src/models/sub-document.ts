import { NotifyPropertyChanged } from "..";
import { SimpleEventDispatcher } from "strongly-typed-events";
import Serializable from "./serializable";
import Document from "./document"

export default abstract class SubDocument extends Serializable implements NotifyPropertyChanged
{
    public onPropertyChanged = new SimpleEventDispatcher<string>()

    public static getArrayProxy<T extends SubDocument>(proxyTarget: any[], parent: Document, serializeName: string, ctor: new () => T): T[]
    {
        return new Proxy(proxyTarget, {
            get: (target: any, prop) =>
            {
                //if prop is array index, create T from data if not already created 
                if (typeof prop === "string" && !isNaN(Number(prop)) && !(target[prop] instanceof SubDocument))
                {
                    const subDoc = new ctor()
                    subDoc.loadRecord(target[prop])
                    subDoc.onPropertyChanged.sub(() => parent.addSetOperator(`${serializeName}.${prop}`, subDoc.toRecord()))
                    target[prop] = subDoc
                }
                return target[prop]
            },
            set: (target, prop, value) =>
            {
                target[prop] = value
                if (typeof prop === "string" && !isNaN(Number(prop)))
                    parent.addSetOperator(`${serializeName}.${prop}`, (target[prop] as Document).toRecord())
                return true
            }
        })
    }
}