import { IThing, IThingProperty, PropertyDataType } from '../models/interface/thing.js';
import { OrgsAPI, BucketsAPI, Organization } from '@influxdata/influxdb-client-apis';
import { InfluxDB, Point, WriteApi, QueryApi, flux, fluxDateTime, fluxString } from '@influxdata/influxdb-client';
import { Config, Measurement } from '../types/index.js';
import { DeviceStatus, IDevice } from '../models/interface/device.js';
import { logger } from '../logger/index.js';

export class InfluxService {
    influxDB: InfluxDB;
    bucketsApi: BucketsAPI;
    writeApi: WriteApi;
    queryApi: QueryApi;
    bucket: string

    constructor(config: Config['influxDb']) {
        this.bucket = config.bucket;

        this.influxDB = new InfluxDB({ url: config.url, token: config.apiKey });
        this.writeApi = this.influxDB.getWriteApi(config.organization, this.bucket);
        this.bucketsApi = new BucketsAPI(this.influxDB);
        this.queryApi = this.influxDB.getQueryApi(config.organization);
    }

    public static createMeasurement(
        deviceId: string,
        deviceName: string,
        thingId: IThing['config']['nodeId'],
        property: IThingProperty,
        sample: { value: any; timestamp: Date }
    ): Point {
        const point = new Point('measurement')
            .tag('deviceId', deviceId)
            .tag('deviceName', deviceName)
            .tag('thingId', thingId)
            .tag('propertyId', property.propertyId)
            .timestamp(sample.timestamp);

        if (property.dataType === PropertyDataType.boolean) {
            point.booleanField('value_bool', sample.value === true || sample.value === 'true' ? true : false);
        } else if (property.dataType === PropertyDataType.integer) {
            point.intField('value_int', Number(sample.value));
        } else if (property.dataType === PropertyDataType.float) {
            point.floatField('value_float', Number(sample.value));
        } else {
            point.stringField('value_string', sample.value);
        }
        return point;
    }

    public static createDeviceStateMeasurement(
        deviceId: string,
        deviceName: string,
        sample: { value: DeviceStatus; timestamp: Date }
    ): Point {
        const point = new Point('measurement')
            .tag('deviceId', deviceId)
            .tag('deviceName', deviceName)
            .tag('thingId', '$internal')
            .tag('propertyId', '$state')
            .timestamp(sample.timestamp);

        point.stringField('value_string', sample.value);
        return point;
    }

    public async saveMeasurements(points: Point[]) {
        this.writeApi.writePoints(points);
        await this.writeApi.flush();
    }

    public async saveMeasurement(point: Point) {
        this.writeApi.writePoint(point);
        await this.writeApi.flush();
    }

    public async getOrg(org: string): Promise<Organization> {
        const orgsAPI = new OrgsAPI(this.influxDB);
        const organizations = await orgsAPI.getOrgs({ org });
        if (!organizations || !organizations.orgs || !organizations.orgs.length) {
            throw new Error(`No organization named "${org}" found!`);
        }

        return organizations.orgs[0]!;
    }

    public async deleteAndCreateBucket(org: string, name: string) {
        const organization = await this.getOrg(org);
        if (!organization) return null;

        logger.info(`Using organization "${org}" identified by "${organization.id}"`);

        const buckets = await this.bucketsApi.getBuckets({ orgID: organization.id, name });
        if (buckets && buckets.buckets && buckets.buckets.length) {
            logger.info(`Bucket named "${name}" already exists"`);
            const bucketID = buckets.buckets[0].id!;
            logger.info(`*** Delete Bucket "${name}" identified by "${bucketID}" ***`);
            await this.bucketsApi.deleteBucketsID({ bucketID });
        }

        await this.bucketsApi.postBuckets({ body: { orgID: organization.id!, name, retentionRules: [] } });
    }

    public async getMeasurements(deviceId: IDevice['_id'], thingId: IThing['_id'], from: Date, to: Date) {
        const fluxQuery = flux`
        from(bucket: ${fluxString(this.bucket)})
        |> range(start: ${fluxDateTime(from.toISOString())}, stop: ${fluxDateTime(to.toISOString())})
        |> filter(fn: (r) => r["deviceId"] == ${fluxString(deviceId)})
        |> filter(fn: (r) => r["thingId"] == ${fluxString(thingId)})
       `;

        const rows: Measurement[] = [];

        return new Promise<Measurement[]>((resolve, reject) =>
            this.queryApi.queryRows(fluxQuery, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row) as Measurement;
                    rows.push(o);
                },
                error(error) {
                    logger.error('QUERY FAILED', error);
                    reject(error);
                },
                complete() {
                    // manually sort, because for some queries the order was invalid
                    // even using sort function in query did not help
                    rows.sort((a, b) => {
                        if (a._time < b._time) {
                            return -1;
                        }
                        if (a._time > b._time) {
                            return 1;
                        }
                        return 0;
                    })
                    resolve(rows);
                },
            })
        );
    }
}
