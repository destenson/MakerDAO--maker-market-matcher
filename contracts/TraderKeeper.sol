import 'maker-otc/simple_market.sol';
import 'maker-otc/assertive.sol';
import 'erc20/erc20.sol';

contract TraderKeeper is Assertive {
    
    SimpleMarket maker_market;
    address maker_market_address
    address owner;
    
    function TraderKeeper (SimpleMarket market_contract, address maker_address) {
        maker_market = market_contract; 
        maker_market_address = maker_address;
        owner = msg.sender;
    }
    
    function withdraw(ERC20 token, uint token_amount) {
        if(msg.sender == owner) {
            token.transfer(msg.sender, token_amount);
        }
    }
    
    function deposit(ERC20 token, uint token_amount) {
        if(msg.sender == owner) {
            token.transferFrom(msg.sender, this, token_amount);
        }
    }
    
    //initially only the amount that was bought can be sold, so quantity is the same for bid/ask
    function trade(uint bid_id, uint ask_id, uint quantity, ERC20 buying, ERC20 selling) {
        var buy_allowance = buying.allowance(this, maker_market_address);
        if(buy_allowance < 500) {
            buying.approve(maker_market_address, 1000);
        }
        var sell_allowance = selling.allowance(this, maker_market_address);
        if(sell_allowance < 500) {
            selling.approve = selling.approve(maker_market_address, 1000);
        }
        maker_market.buyPartial(bid_id, quantity);
        maker_market.buyPartial(ask_id, quantity);
        //assert(bidSuccess);
        //assert(askSuccess);
    }
    
}

contract TraderKeeperMarket is SimpleMarket {}