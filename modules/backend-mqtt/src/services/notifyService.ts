import { IThingProperty, IThing } from 'common/models/interface/thing';
import { IUser } from 'common/models/interface/userInterface';
import { INotify, INotifyThing, INotifyThingProperty } from 'common/models/interface/notifyInterface';
import { groupBy, values, map } from 'ramda';
import { NotifyModel } from 'common/models/notifyModel';
import { ObjectId } from '../utils/objectId.js';

const prepareQuery =
    (updateQuery: any, nodeId: INotifyThing['nodeId']) =>
        (arg: { _id: INotify['_id']; prop_id: IThingProperty['_id'] }) => {
            const { _id, prop_id } = arg;
            return {
                updateOne: {
                    filter: {
                        _id: new ObjectId(_id),
                    },
                    update: updateQuery,
                    arrayFilters: [{ 'thing.nodeId': nodeId }, { 'property._id': new ObjectId(prop_id) }],
                },
            };
        };

/**
 * Service for updating notification rules metadata
 */
export class NotifyService {
    /**
     * update all notifcations rule as if they were sended
     * @param sended
     * @param nodeId
     */
    static async refreshSendedItems(
        sended: { _id: IThing['_id']; prop_id: IThingProperty['_id'] }[],
        nodeId: INotifyThing['nodeId']
    ) {
        const queries = map(
            prepareQuery(
                {
                    'things.$[thing].properties.$[property].tmp': { lastSatisfied: true, lastSendAt: new Date() },
                },
                nodeId
            ),
            sended
        );
        const result = await NotifyModel.bulkWrite(queries);
        // console.log("bulk matchedCount", result.matchedCount, "modifiedCount", result.modifiedCount);
    }

    /**
     * Update all notification rules as if they were not sended
     */
    static async refreshNotSendedItems(
        notSended: {
            unSatisfiedItems: { _id: INotify['_id']; prop_id: IThingProperty['_id'] }[];
            satisfiedItems: { _id: INotify['_id']; prop_id: IThingProperty['_id'] }[];
        },
        nodeId: INotifyThing['nodeId']
    ) {
        const queries1 = map(
            prepareQuery(
                {
                    'things.$[thing].properties.$[property].tmp.lastSatisfied': false,
                },
                nodeId
            ),
            notSended.unSatisfiedItems
        );
        const queries2 = map(
            prepareQuery(
                {
                    'things.$[thing].properties.$[property].tmp.lastSatisfied': true,
                },
                nodeId
            ),
            notSended.satisfiedItems
        );

        const result = await NotifyModel.bulkWrite(queries1.concat(queries2));
        // console.log("bulk2 matchedCount", result.matchedCount, "modifiedCount", result.modifiedCount);
    }
}
