const createResponse = function (msg) {
    let body = msg

    let response = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        statusCode: 200,
        body: JSON.stringify(body)
    }
    return response
}

module.exports = createResponse