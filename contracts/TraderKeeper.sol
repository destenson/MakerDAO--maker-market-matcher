import 'maker-otc/simple_market.sol';
import 'maker-otc/assertive.sol';
import 'erc20/erc20.sol';

contract TraderKeeper is Assertive {
    
    SimpleMarket maker_market;
    address maker_market_address
    address owner;
    
    function TraderKeeper (address maker_address) {
        maker_market = new SimpleMarket(maker_address)
        maker_market_address = maker_address;
        owner = msg.sender;
    }
    
    function withdraw(ERC20 token, uint token_amount) {
        assert(msg.sender == owner);
        token.transfer(msg.sender, token_amount);
    }
    
    function deposit(ERC20 token, uint token_amount) {
        assert(msg.sender == owner);
        token.transferFrom(msg.sender, this, token_amount);
    }
    function balanceOf(ERC20 token) constant returns (uint) {
        assert(msg.sender == owner);
        return token.balanceOf(this)
    }
    
    //initially only the amount that was bought can be sold, so quantity is the same for bid/ask
    function trade(uint bid_id, uint ask_id, uint quantity, ERC20 buying, ERC20 selling) {
        assert(msg.sender == owner);
        var buy_allowance = buying.allowance(this, maker_market_address);
        if(buy_allowance < 500) {
            buying.approve(maker_market_address, 1000);
        }
        var sell_allowance = selling.allowance(this, maker_market_address);
        if(sell_allowance < 500) {
            selling.approve = selling.approve(maker_market_address, 1000);
        }
        
        var buySuccess = maker_market.buyPartial(bid_id, quantity);
        assert(buySuccess);        
        var sellSuccess = maker_market.buyPartial(ask_id, quantity);
        assert(sellSuccess);
    }
}

contract TraderKeeperMarket is SimpleMarket {}