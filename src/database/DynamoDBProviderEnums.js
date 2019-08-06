const QUERY_OPTIONS = {
    ATTRIBUTES_TO_GET: 'AttributesToGet',
    CONDITIONAL_OPERATOR: 'ConditionalOperator',
    CONSISTENT_READ: 'ConsistentRead',
    EXCLUSIVE_START_KEY: 'ExclusiveStartKey',
    EXPRESSION_ATTRIBUTE_NAMES: 'ExpressionAttributeNames',
    EXPRESSION_ATTRIBUTE_VALUES: 'ExpressionAttributeValues',
    FILTER_EXPRESSION: 'FilterExpression',
    INDEX_NAME: 'IndexName',
    KEY_CONDITION_EXPRESSION: 'KeyConditionExpression',
    KEY_CONDITIONS: 'KeyConditions',
    LIMIT: 'Limit',
    PROJECTION_EXPRESSION: 'ProjectionExpression',
    QUERY_FILTER: 'QueryFilter',
    RETURN_CONSUMED_CAPACITY: 'ReturnConsumedCapacity',
    SCAN_INDEX_FORWARD: 'ScanIndexForward',
    SELECT: 'Select',
    TABLE_NAME: 'TableName'
}

const PLAYER_TABLE_SCHEMA = {
    name: 'S',
    streak: 'N',
    lastUpdated: 'N',
    ranking: 'N',
    peak: 'N',
    wins: 'N',
    losses: 'N'
}

module.exports = {
    QUERY_OPTIONS,
    PLAYER_TABLE_SCHEMA
}