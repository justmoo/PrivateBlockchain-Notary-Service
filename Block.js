/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		this.hash = "";
		this.height = 0;
		this.body = data;
		this.previousBlockHash="";
		this.time = new Date().getTime().toString().slice(0,-3);
	}
}

module.exports.Block = Block;