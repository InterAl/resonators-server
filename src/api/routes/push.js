import api from "../express";
import routeHandler from "../routeHandler";

import { push_subscriptions } from "../../db/sequelize/models";

const BASE_URL = "/api/push-subscription";

/**
 * Saves a user's push notification subscription to the DB.
 */
api.post(
    BASE_URL,
    routeHandler(async (req, res) => {
        const existingSubscription = await getSubscription(req.body.endpoint, req.appSession.user);
        if (existingSubscription) {
            res.status(200).json(existingSubscription);
        } else {
            res.status(201).json(await saveSubscription(req.appSession.user, req.body));
        }
    })
);

/**
 * Replaces a push subscription with another.
 * Used for updaing a user's subscription after it has expired or has been renewed.
 */
api.put(
    BASE_URL,
    routeHandler(async (req, res) => {
        const { oldSubscription, newSubscription } = req.body;
        deleteSubscription(oldSubscription.endpoint, req.appSession.user);
        res.status(201).json(await saveSubscription(req.appSession.user, newSubscription));
    })
);

/**
 * Deletes a push subscription from the DB.
 * Used for unsubscribing a user from notifications on a certain client.
 */
api.delete(
    BASE_URL,
    routeHandler(async (req, res) => {
        res.status(200).json(await deleteSubscription(req.body.endpoint, req.appSession.user));
    })
);

/**
 * Saves a new push subscription.
 *
 * @param {users} user - the user to whom the subscription belongs
 * @param {Object} subscription - a subscription object, as generated by a push service
 * @returns {Promise<push_subscriptions|null>} - the new push subscription entry from the DB
 */
async function saveSubscription(user, subscription) {
    return await push_subscriptions.create({
        ...subscription,
        user_id: user.id,
    });
}

/**
 * Find a user's push subscription by it's unique endpoint.
 *
 * @param {String} endpoint - the endpoint of the susbcription
 * @param {users} user - the user to whom the subscription belongs.
 *                       this is to prevent access by users who do not own the subscription.
 * @returns {Promise<push_subscriptions|null>} - the queried push subscription object
 */
async function getSubscription(endpoint, user) {
    return await push_subscriptions.findOne({
        where: {
            endpoint,
            user_id: user.id,
        },
    });
}

/**
 * Deletes a user's push subscription by it's unique endpoint.
 * Safely ignores non-existent subscriptions.
 *
 * @param {String} endpoint - the endpoint of the subscription
 * @param {users} user - the user to whom the subscription belongs.
 *                       this is to prevent deletion by users who do not own the subscription.
 * @returns {Promise<push_subscriptions|null>} - the deleted push subscription
 */
async function deleteSubscription(endpoint, user) {
    const subscription = await getSubscription(endpoint, user);
    if (subscription) await subscription.destroy();
    return subscription;
}
