# serverless-notifications
Establish a websocket connection via api gateway, save connectionIds to Dynamo, broadcast messages to all clients.
## Install
```
npm i
sls deploy
```
## Run
```
wscat -c <the wss://* endpoint printed during deploy>`
{"action":"sendMessage","data":"test"}
```
## Credits
https://github.com/mavi888/websockets-chat
