import 'maker-otc/simple_market.sol';

contract TraderKeeper {
    
    struct Wallet {
        mapping (bytes32 => uint) tokens;
    }
    
    mapping(address => Wallet) users;
    SimpleMarket maker_address;
    
    function TraderKeeper (SimpleMarket contract_address) {
        maker_address = contract_address;
    }
    
    function withdraw(bytes32 which_token, uint token_amount) {
        var user = users[msg.sender];
        if(user.tokens[which_token] >= token_amount) {
            //transfer(msg.sender, token_amount, which_token);
            user.tokens[which_token] -= token_amount;
        }
        else {
            //transfer(msg.sender, user.tokens[which_token], which_token);
            user.tokens[which_token] = 0;
        }
    }
    
    function deposit(bytes32 which_token, uint token_amount) {
        //transferFrom(msg.sender, token_amount, which_token);
        users[msg.sender].tokens[which_token] += token_amount;
    }
    
    //initially only the amount that was bought can be sold, so quantity is the same for bid/ask
    function trade(uint bid_id, uint ask_id, uint quantity) {
        maker_address.buyPartial(bid_id, quantity);
        maker_address.buyPartial(ask_id, quantity);
    }
    
}