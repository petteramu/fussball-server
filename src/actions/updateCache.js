const updateCache = require('../utils/updateCache')

const handler = async function (e, context) {
    await updateCache(process.env.CACHE_BUCKET);
}

module.exports.handler = handler