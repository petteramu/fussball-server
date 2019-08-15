const _ = require('lodash')

const DynamoDBProviderFactory = require('./DynamoDBProvider')
const { PLAYER_TABLE_SCHEMA } = require('./DynamoDBProviderEnums')

const { GAMES_TABLE, RANKINGS_TABLE, TOURNAMENT_TABLE } = process.env

class DynamoDBRepositoryFactory {
    getInstance () {
        if(this.instance)
            return this.instance

        this.instance = new DynamoDBRepository(DynamoDBProviderFactory.getInstance())
        return this.instance
    }

    getTestInstance () {
        if(this.testInstance)
            return this.testInstance

        this.testInstance = new DynamoDBRepository(DynamoDBProviderFactory.getTestInstance())
        return this.testInstance
    }
}

class DynamoDBRepository {
    constructor (provider) {
        this.provider = provider
    }

    /* Adds a game to the database
     * @param [Object] gameObject
     * @example input
     * {
     *  winner: 'white',
     *  timestamp: 123456789
     *  white: {
     *      key: 'Some name',
     *      preRanking: 1200,
     *      change: -20
     *  },
     *  black: {
     *      key: 'Someone else',
     *      preRanking: 1200,
     *      change: 20 
     *  }
     * }
     * @return [Promise]
     */
    addGame (gameObject) {
        if(!gameObject) {
            throw new Error("DDBRepository.addGame gameObject undefined")
        }
        if(!gameObject.winner) {
            throw new Error("DDBRepository.addGame gameObject.winner undefined")
        }
        if(!gameObject.winner) {
            throw new Error("DDBRepository.addGame gameObject.winner undefined")
        }
        if(!gameObject.timestamp) {
            throw new Error("DDBRepository.addGame gameObject.timestamp undefined")
        }
        if(!gameObject.white) {
            throw new Error("DDBRepository.addGame gameObject.white undefined")
        }
        if(!gameObject.white.key) {
            throw new Error("DDBRepository.addGame gameObject.white.key undefined")
        }
        if(gameObject.white.change == undefined) {
            throw new Error("DDBRepository.addGame gameObject.white.change undefined")
        }
        if(!gameObject.white.preRanking) {
            throw new Error("DDBRepository.addGame gameObject.white.preRanking undefined")
        }
        if(!gameObject.black) {
            throw new Error("DDBRepository.addGame gameObject.black undefined")
        }
        if(!gameObject.black.key) {
            throw new Error("DDBRepository.addGame gameObject.black.key undefined")
        }
        if(gameObject.black.change == undefined ) {
            throw new Error("DDBRepository.addGame gameObject.black.change undefined")
        }
        if(!gameObject.black.preRanking) {
            throw new Error("DDBRepository.addGame gameObject.black.preRanking undefined")
        }
        
        return this.provider.createItem(GAMES_TABLE, gameObject)
    }

    removeGame (id) {

    }

    addTournament (tournament) {
        if(!tournament) {
            throw new Error("No data received")
        }
        if(!tournament.tournamentName) {
            throw new Error("No name given to tournament")
        }
        if(!tournament.players || !Array.isArray(tournament.players)) {
            throw new Error("No players given to tournament")
        }
        if(!tournament.options) {
            throw new Error("No options given to tournament")
        }
        if(typeof tournament.options.double !== "boolean") {
            throw new Error("Double option must be a boolean")
        }
        if(!tournament.matches || !Array.isArray(tournament.matches)) {
            throw new Error("No matches given to tournament")
        }

        return this.provider.createItem(TOURNAMENT_TABLE, tournament)
    }

    async getTournamentsOverview () {
        let result = await this.provider.scan(TOURNAMENT_TABLE, { ProjectionExpression: 'id, tournamentName, created' })
        return result
    }

    async getTournament (id) {
        let result = await this.provider.getItem(TOURNAMENT_TABLE, { id })
        return result
    }

    async getGame (id) {
        let result = await this.provider.getItem(GAMES_TABLE, { id })
        return result
    }

    getGames (count = -1, playerOne, playerTwo) {
        let params = {}
        if(count > 0)
            params.limit = count
        
        if(playerOne) {
            var filterExpression = '(white.key = :p1 or black.key = :p1)'
            var attributeValues = {
                ':p1': playerOne
            }
            if(playerTwo) {
                filterExpression += ' and (white.key = :p2 or black.key = :p2)'
                attributeValues[':p2'] = playerTwo
            }
        }

        params.ExpressionAttributeValues = attributeValues
        params.FilterExpression = filterExpression

        return this.provider.scan(GAMES_TABLE, params)
    }

    getPlayer (name) {
        let keys = { name }
        return this.provider.getItem(RANKINGS_TABLE, keys)
    }

    getRankings () {
        return this.provider.scan(RANKINGS_TABLE, {})
    }

    updatePlayer (playerKey, playerObject) {
        let dbKeys = { name: playerKey }
        let cleanedObject = _.pick(playerObject, Object.keys(PLAYER_TABLE_SCHEMA))
        return this.provider.updateItemSimple(RANKINGS_TABLE, dbKeys, cleanedObject)
    }
}

module.exports = new DynamoDBRepositoryFactory()