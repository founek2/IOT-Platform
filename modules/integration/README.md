# IoT Platform client

This TypeScript client communicates with [IoT Platform](https://prod.iotplatforma.cloud) over MQTT. It can run in Node.js or be bundled for browsers. Add nodes and properties (including optional set callbacks); the client handles device announcement, pairing, and property updates.

## Build

From the monorepo root, build the compiled JavaScript and declarations with:

```sh
yarn workspace integration build
```

The package entry point is `dist/index.js`. It is ESM and can be imported by Node.js or a browser bundler:

```ts
import { Platform, ComponentType, PropertyDataType } from 'integration';
```

## Runtime notes

- Node.js clients can connect to an MQTT broker using the URL accepted by MQTT.js, such as `mqtts://broker.example`.
- Browser clients must use an MQTT-over-WebSocket endpoint (`ws://` or `wss://`); browsers cannot open raw MQTT TCP connections.
- Pass a storage adapter implementing `getItem`, `setItem`, and `removeItem`. Browser `localStorage` already implements this interface; Node.js applications can supply their own persistent adapter.
- MQTT credentials and the paired device API key are handled by the client. Keep browser broker endpoints and credentials appropriately restricted.

## Note

The paired API key is persisted through the storage adapter under the device ID.

## License

This code is released under the MIT License.
