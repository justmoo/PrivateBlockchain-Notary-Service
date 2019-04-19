const SHA256 = require('crypto-js/sha256');
const Block = require('./Block.js');
const blockchain =require('./BlockChain');
const Request =require('./Request');
const validRequest= require('./ValidRequest');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');


/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.mempool = [];
        this.timeoutRequests = [] ;
        this.getBlockByIndex();
        this.postNewBlock();
        this.getTheBlockchain();
        this.requestValidation();
        this.validateAddess();
        this.getBlockByHash();
        this.getBlockByAddress();
        
      
        this.bc = new blockchain.Blockchain();
        
        
    }
    requestValidation(){
        let self = this;
        this.app.post("/requestValidation", (req, res) => {
            //code
            //takes an address from req.body.address
            //then gives a message to verifiy 
            var requestTime = new Date().getTime().toString().slice(0,-3);
            var newRq = new Request.Request();

            newRq.requestTimeStamp = requestTime;
            newRq.walletAddress = req.body.address;
            newRq.message = `${req.body.address}:${requestTime}:starRegistry`;
            newRq.validationWindow = 300;
            this.mempool.push(newRq);
            res.json(newRq);

        });
    }
    validateAddess(){
        
        this.app.post("/message-signature/validate", (req, res) => {
            //code
            //takes an address from(req.body.address) and signature( from req.body.signature)
            //then gives a message to verifiy 
            if (this.mempool.length > 0){
               
                // console.log(this.mempool);
                //looking for the address in the mempool
            for(var i = 0 ; i < this.mempool.length ; i++){
                if(req.body.address == this.mempool[i].walletAddress){

                    var requested = this.mempool[i];
                    
                    var requestTime = new Date().getTime().toString().slice(0,-3);
                    if(requestTime - requested.requestTimeStamp >= 300){ // if the time passes the limit which is 300
                        //adds it to the timedout
                        this.timeoutRequests.push(requested);
                        //removes it from mempool
                        this.mempool.splice(i,1);
                        return res.send('timedout!');
                        
                    }else{
                        //handle if the timing is right
                    var address = requested.walletAddress;
                    var signature =req.body.signature;
                    var message = requested.message;
                    var isValid =bitcoinMessage.verify(message, address, signature);
                    //console.log("2");
                    //console.log(this.mempool);
                    //console.log(isValid);
                    // if the signature is valid it goes into this if  
                        if(isValid){
                            //create a valid object and adds it to the mempool
                            var newValidRequest= new validRequest.ValidRequest();
                            newValidRequest.registerStar =true;
                            newValidRequest.status.address= address;
                            newValidRequest.status.requestTimeStamp= requested.requestTimeStamp;
                            newValidRequest.status.message = message;
                            //counts the remaining time
                            newValidRequest.status.validationWindow = 300 - (requestTime - requested.requestTimeStamp);
                            newValidRequest.status.messageSignature = isValid;
                            //delete the "Request from the mempool"
                            this.mempool.splice(i,1);
                            //adds the the valid request
                            this.mempool.push(newValidRequest);
                           // console.log(this.mempool);
                           return res.send(newValidRequest);// changed to return, first time encountering "Can't set headers after they are sent." caused by res.send(), it keeps executing after
                            
                        }else{

                            return res.send("the signature isn't valid");
                        }
                    
                    
                    }
                
                }
            
         }
         return res.send("the address isn't in the mempool :(");
    }else{

        return res.send('the mempool is empty');
        }
           
        });
    }
    
      //for testing purposes :)
       getTheBlockchain(){
        let self = this;
        this.app.get("/blocks", async (req, res) => {
            // return the whole blockchain
           let blockchain =await self.bc.getBlockchain();
            res.send(blockchain);
            
        });
     }
   
     // Implement a GET Endpoint to retrieve a block by index, url: "/block/:index"
     // Working perfectly 
       getBlockByIndex() {
        let self = this;
        // returns any block if its in the blockchain height
        this.app.get("/block/:index", async (req, res) => {
            
                // checks if the index in the blockchain height
                if(req.params.index > await self.bc.getBlockHeight()){
                        res.send("this block doesn't exist");

                }else{
                    // decode the story and return the block
                    if (req.params.index > 0){
                    let block = await self.bc.getBlock(req.params.index);
                    var hex = block.body.star.story;
                    block.body.star.storyDecoded = hex2ascii(hex);

                    return res.send(block);
                    }else{
                        // genesis block has nothing so it doesn't need to be decoded
                        let block = await self.bc.getBlock(req.params.index);
                        return res.send(block);
                    }
                }
        });
    }
    getBlockByHash() {
        let self = this;
        // returns any block if its in the blockchain height
        this.app.get("/stars/hash::HASH", async (req, res) => {
            
               let block = await self.bc.getBlockByHash(req.params.HASH);
               if (block == null){
                   res.send('there is no such hash')
               }else{
               console.log(block);
               if(block.height>0){
                   //if it's not the genesis block decode the story
                var hex = block.body.star.story;
                block.body.star.storyDecoded = hex2ascii(hex);
                return res.send(block);

               }else{
                   // genesis block only gets in here :)
                   return res.send(block);
               }
            }
        });
    }
    getBlockByAddress() {
        let self = this;
        // returns any block if its in the blockchain height
        this.app.get("/stars/address::ADDRESS", async (req, res) => {
            
               let blocks = await self.bc.getBlockByAddress(req.params.ADDRESS);
               if (blocks.length == 0){
                   return res.send('there is no such address');

               }else{
                   for(var i=0;i<blocks.length;i++){
                    var hex = blocks[i].body.star.story;
                    blocks[i].body.star.storyDecoded =hex2ascii(hex);

                   }
                
               
                 return res.send(blocks);

               }
            }
        );
    }
    
    // Implement a POST Endpoint to add a new Block, url: "/block"
    // checks if the request has "body" then adds it to the blockchain 
    postNewBlock() {
        this.app.post("/block", async(req, res) => {
            try{
            if(req.body.address == null|| req.body.star==null){
               return res.send("can't send an empty block");
            }else{
                for(var i=0; i<this.mempool.length;i++){
                    if(req.body.address == this.mempool[i].status.address){
                        
                        // encode star
                        // add the block to the blockchain 
                        // removes the validRequest from mempool
                        let body = {
                            address: req.body.address,
                            star: {
                                      ra: req.body.star.ra,
                                      dec: req.body.star.dec,
                                      mag: req.body.star.mag,
                                      cen: req.body.star.cen,
                                      story: Buffer(req.body.star.story).toString('hex')
                            }
                       }
                        let newBlock = new Block.Block(body);
                        await this.bc.addBlock(newBlock);
                        this.mempool.splice(i,1);
                      return res.json(newBlock);
                    }
                     
                    
                }
                 return res.send("we couldn't find the ValidRequest");
                
               
            }
         }catch(err){
            console.log(err);
        }
    });
    }   
   
    

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}