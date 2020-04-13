import { ISimpleEvent } from "strongly-typed-events"

export default interface NotifyPropertyChanged {
    onPropertyChanged: ISimpleEvent<string>
}