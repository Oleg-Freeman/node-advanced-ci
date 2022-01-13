const mongoose = require('mongoose');
const redis = require('redis');
const keys = require('../config/keys');
const client = redis.createClient(keys.redisUrl);
const util = require('util');
const exec = mongoose.Query.prototype.exec;

client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = async function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || 'default-key');

    return this;
}

mongoose.Query.prototype.exec = async function () {
    // console.log('ABOUT_TO_RUN_QUERY');
    if (!this.useCache) {
        return exec.apply(this, arguments);
    } else {
        const key = JSON.stringify(Object.assign({ collection: this.mongooseCollection.name }, this.getQuery()));
        console.log(key);

        const cacheValue = await client.hget(this.hashKey, key);

        if (cacheValue) {
            console.log('SERVING_FROM_CACHE');
            const doc = JSON.parse(cacheValue);

            if (Array.isArray(cacheValue)) {
                return cacheValue.map(d => new this.model(d));
            }

            return new this.model(doc);
        }

        const result = await exec.apply(this, arguments);
        client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

        console.log('SERVING_FROM_MONGODB');
        return result;
    }
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}
