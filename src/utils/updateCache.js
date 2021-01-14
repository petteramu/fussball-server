const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const s3 = require("aws-sdk").S3
const _ = require('lodash')

module.exports = function (bucketName) {
    return new Promise(async function (resolve, reject) {
        let games = await db.getGames()
        games = _.sortBy(games, ['timestamp']).reverse()
    
        let rankings = await db.getRankings()
        let params = {
            Bucket: bucketName,
            Key: "rankings-and-matches",
            ContentType: "text/json",
            Body: JSON.stringify({
                games,
                rankings
            })
        }
        new s3().putObject(params, (err, data) => {
            err ? reject(err) : resolve(data)
        })
    })
}
