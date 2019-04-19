## Project 4: Build a Private Blockchain Notary Service


this is the 4th project BND from udacity <br>
<img src="./img/project4-workflow.png" height=400 width=300>


## how to setup 
1- Download the project or clone it.<br>
2- Run command __npm install__ to install the project dependencies.<br>
3-Run command  __node app.js__ in the root directory.<br>


## Testing the project
- after running the command __node app.js__ you can go to <b>localhost:8000/requestValidation</b> and send your address , it should be a json obejct 
<br>
{
	"address":"1LNkG4AW6KEMA1xS987ah1jJaQimxcJe5m"
}
<br>
- Then you will receive a message, sign the message using <b>electrum</b> and send the signature to  <b>localhost:8000/message-signature/validate</b> the message should be like this
<br>
{
	"address":  "1LNkG4AW6KEMA1xS987ah1jJaQimxcJe5m",
	"signature": "H6/IJIWciBCVGiq+bDB5vk0m3M59n0o0Tc/pvoonTpP5c3jA1VOkjm6KWT2bCVWMoozu6kzlCK6mLpYGK54bMgw="
	
}
<br>
- If the signature is valid it's gonna grant permission to add one block.
<br>

 - To add blocks to the blockchain you need to use __POSTMAN__ or an alternative and __POST__ to __localhost:8000/block__
the formatting should be like this :
<br>{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}


- To check all the blocks in the blockchain use __localhost:8000/blocks__
- To check a certain block hash you can go to <b>localhost:8000/stars/hash:[HASH]</b>
<br>
for example : localhost:8000/stars/hash:dc0664f75de590b566aaa1f3ae10968540b1592794a2d2089788df4ad0821fa7
<br>
- To check a certain wallet address you can go to <b>localhost:8000/stars/address:[ADDRESS]</b>
<br>
for example : localhost:8000/stars/address:1LNkG4AW6KEMA1xS987ah1jJaQimxcJe5m
  