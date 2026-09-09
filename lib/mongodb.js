import dns from 'dns';
if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
}

async function getConnectedClient() {
    if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
            client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect();
        }
        return global._mongoClientPromise;
    } else {
        client = new MongoClient(uri, options);
        return client.connect();
    }
}

// Export a Thenable object that lazy-connects only when awaited
clientPromise = {
    then: (onFulfilled, onRejected) => getConnectedClient().then(onFulfilled, onRejected),
    catch: (onRejected) => getConnectedClient().catch(onRejected)
};

export default clientPromise;
