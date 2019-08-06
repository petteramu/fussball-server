const firebase = require("../database");
process.env.GAMES_TABLE = 'Nf6Chill_games_dev'
process.env.RANKINGS_TABLE = 'Nf6Chill_rankings_dev'
process.env.AWS_REGION = 'eu-central-1'
process.env.DDB_ENDPOINT = 'arn:aws:dynamodb:eu-central-1:333453541777:table/'
const uuid = require('uuid/v1')
const request = require('request')

const staggerMs = 200

firebase.onInitialized(() => {
    let matches = modifyMatches(firebase.getMatches())
    let players = modifyPlayers(firebase.getPlayers())

    for(let i = 0; i < matches.length; i++) {
        staggeredMatchAdd(matches[i], i, matches.length)
    }
})

function staggeredMatchAdd (match, index, max) {
    setTimeout(() => {
        try {
            request.post(
                'https://e5xbxwe7dk.execute-api.eu-central-1.amazonaws.com/dev/rawgame',
                { json: match },
                function(err, res) {
                    if(err) {
                        console.log(match)
                        console.log(e)
                        process.exit()
                    }
                    console.clear()
                    console.log(`${index + 1}/${max}`)
                    if(index + 1 === max) {
                        console.log('Done')
                        process.exit()
                    }
                }
            )
        }
        catch(e) {
            console.log(match)
            console.log(e)
            process.exit()
        }
    }, index * staggerMs)
}

function staggeredPlayersAdd (player, index, max) {
    setTimeout(() => {
        request.post(
            'https://e5xbxwe7dk.execute-api.eu-central-1.amazonaws.com/dev/rawplayer',
            { json: player },
            function(err, res) {
                if(err) {
                    console.log(player)
                    console.log(e)
                    process.exit()
                }
                console.clear()
                console.log(`${index + 1}/${max}`)
                if(index + 1 === max) {
                    console.log('Done')
                    process.exit()
                }
            }
        )
    }, index * staggerMs)
}

function modifyMatches (matches) {
    let newArr = []
    Object.keys(matches).forEach((key) =>  {
        let match = matches[key]
        match.id = uuid()
        if(match.winner === 'remis') {
            match.white.change = match.white.gain
            match.black.change = match.black.loss
            delete match.white.gain
            delete match.black.loss
        }
        else if(match && !(match.black && match.black.change
            && match.white && match.white.change)) {
            let winnerObj = match[match.winner]
            let loserObj = match[(match.winner === 'white' ? 'black' : 'white')]
            
            let winnersChange = (winnerObj.gain == undefined) ? winnerObj.loss : winnerObj.gain
            winnerObj.change = Math.abs(winnersChange)
            delete winnerObj.gain
            delete winnerObj.loss
            
            let losersChange = (loserObj.gain == undefined) ? loserObj.loss : loserObj.gain
            loserObj.change = -Math.abs(losersChange)
            delete loserObj.gain
            delete loserObj.loss

            newArr.push(match)
        }
        return newArr.push(match)
    })
    return newArr
}

function modifyPlayers (players) {
    let newArr = []
    Object.keys(players).forEach((key) => {
        let player = players[key]
        player.name = key
        newArr.push(player)
    })
    return newArr
}