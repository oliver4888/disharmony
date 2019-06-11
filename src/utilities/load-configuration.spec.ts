import { Expect, Test, TestFixture } from "alsatian";
import Config from "../models/internal/config";
import { isConfigValid } from "./load-configuration";

@TestFixture("Config loading")
export class LoadConfigurationTestFixture
{
    @Test()
    public config_valid_when_all_required_fields_present()
    {
        // ARRANGE
        const config = {
            dbConnectionString: "foo",
            token: "bar",
            serviceName: "baz",
            requiredPermissions: 1000,
            askTimeoutMs: 30,
        }

        // ACT
        const result = isConfigValid(config)

        // ASSERT
        Expect(result).toBe(true)
    }

    @Test()
    public config_valid_when_optional_field_present()
    {
        // ARRANGE
        const config = {
            dbConnectionString: "foo",
            token: "bar",
            serviceName: "baz",
            requiredPermissions: 1000,
            askTimeoutMs: 30,
            heartbeat: {
                url: "foo",
                intervalSec: 30,
            },
        }

        // ACT
        const result = isConfigValid(config)

        // ASSERT
        Expect(result).toBe(true)
    }

    @Test()
    public config_invalid_when_required_field_missing()
    {
        // ARRANGE
        const config = {
            dbConnectionString: "foo",
            token: "bar",
            serviceName: "baz",
            requiredPermissions: 1000,
        } as Config

        // ACT
        const result = isConfigValid(config)

        // ASSERT
        Expect(result).toBe(false)
    }

    @Test()
    public config_invalid_when_optional_field_present_but_invalid()
    {
        // ARRANGE
        const config = {
            dbConnectionString: "foo",
            token: "bar",
            serviceName: "baz",
            requiredPermissions: 1000,
            askTimeoutMs: 30,
            heartbeat: {},
        } as Config

        // ACT
        const result = isConfigValid(config)

        // ASSERT
        Expect(result).toBe(false)
    }
}