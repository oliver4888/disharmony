export default interface EventLogger
{
    /**
     * @param action What happened
     * @param parameters Associated key-value-pairs
     */
    logEvent(action: string, parameters: any): Promise<void>
}