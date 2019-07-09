export default interface EventLogger
{
    /**
     * @param category Event category
     * @param action What happened
     * @param parameters Associated key-value-pairs
     */
    logEvent(category: string, action: string, parameters: any): Promise<void>
}