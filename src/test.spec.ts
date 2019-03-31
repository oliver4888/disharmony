import { Test, Expect, AsyncTest } from "alsatian"
import { resolve } from "dns";

export class SampleTest
{
    @Test()
    public sync_passes()
    {
        Expect(true).toBe(true)
    }

    @Test()
    public sync_fails()
    {
        Expect(false).toBe(true)
    }

    @AsyncTest()
    public async async_passes()
    {
        await new Promise(resolve => setTimeout(resolve, 10))
        Expect(true).toBe(true)
    }

    @AsyncTest()
    public async async_fails()
    {
        await new Promise(resolve => setTimeout(resolve, 10))
        Expect(false).toBe(true)
    }
}