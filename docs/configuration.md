# Configuration
An implementing project should include *config.json* in their root folder. There are some required properties, and some optional.

## Required
- `token`: Discord bot token; string
- `dbConnectionString`: Connection string for the selected Mongo-like database (NeDB or MongoDB); string
- `serviceName`: Friendly name for the bot (currently only used for rich formatting the help command); string
- `requiredPermissions`: Bitfield containing required bot permissions; string

## Optional
- `heartbeat`: Configuration for the heartbeat ferture object
    - `intervalSec`: Heartbeat interval in seconds; number
    - `url`: Heartbeat url; string

## Sample

```JSON
{
    "token": "tokengoeshere",
    "dbConnectionString": "nedb://nedb-data",
    "serviceName": "My Bot",
    "requiredPermissions": "0x00014c00",
    "heartbeat": {
        "intervalSec": 30,
        "url": "http://heartbeat-url.com/whatever"
    }
}
```