class Request {
	constructor(){
		this.walletAddress= "";
        this.message = "";
        this.requestTimeStamp=0;
        this.validationWindow=0;
    }
}

module.exports.Request = Request;