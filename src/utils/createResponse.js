const createResponse = function (msg, statusCode = 200) {
    let body = msg

    let response = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        statusCode: statusCode,
        body: JSON.stringify(body)
    }
    return response
}

module.exports = createResponse