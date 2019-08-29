'use strict'
const AWS = require('aws-sdk')
let dynamo = new AWS.DynamoDB.DocumentClient()

require('aws-sdk/clients/apigatewaymanagementapi')

const CHATCONNECTION_TABLE = 'connectionIdTable'

const successfullResponse = {
  statusCode: 200,
  body: 'everything is alright'
}

module.exports.connect = async event => {
  console.log(event)

  try {
    await addConnection(event.requestContext.connectionId)
    return successfullResponse
  } catch (err) {
    console.log(err)
    return JSON.stringify(err)
  }
}

module.exports.disconnect = async event => {
  console.log(event)

  try {
    await deleteConnection(event.requestContext.connectionId)
    return successfullResponse
  } catch (err) {
    console.log(err)
    return JSON.stringify(err)
  }
}

module.exports.default = async event => {
  console.log('defaultHandler was called')
  console.log(event)

  return {
    statusCode: 200,
    body: 'defaultHandler'
  }
}

module.exports.sendMessage = async event => {
  try {
    await sendMessageToAllConnected(event)
    return successfullResponse
  } catch (err) {
    console.log(err)
    return JSON.stringify(err)
  }
}

const sendMessageToAllConnected = async event => {
  const connectionData = await getConnectionIds()
  return await Promise.all(
    connectionData.Items.map(connectionId => {
      return send(event, connectionId.connectionId)
    })
  )
}

const getConnectionIds = () => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    ProjectionExpression: 'connectionId'
  }

  return dynamo.scan(params).promise()
}

const send = (event, connectionId) => {
  const body = JSON.parse(event.body)
  const postData = body.data

  const endpoint =
    event.requestContext.domainName + '/' + event.requestContext.stage
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: endpoint
  })

  const params = {
    ConnectionId: connectionId,
    Data: postData
  }

  return apigwManagementApi.postToConnection(params).promise()
}

const addConnection = connectionId => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    Item: {
      connectionId: connectionId
    }
  }

  return dynamo.put(params).promise()
}

const deleteConnection = connectionId => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    Key: {
      connectionId: connectionId
    }
  }

  return dynamo.delete(params).promise()
}
