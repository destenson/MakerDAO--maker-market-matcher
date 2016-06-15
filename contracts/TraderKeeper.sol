import 'maker-otc/simple_market.sol';
import 'maker-otc/assertive.sol';
import 'erc20/erc20.sol';

contract TraderKeeper is Assertive {
    
    address owner;
    
    function TraderKeeper () {
        owner = msg.sender;
    }
    
    function withdraw(ERC20 token, uint token_amount) {
        assert(msg.sender == owner);
        assert(token.transfer(msg.sender, token_amount));
    }
    
    function deposit(ERC20 token, uint token_amount) {
        assert(msg.sender == owner);
        assert(token.transferFrom(msg.sender, this, token_amount));
    }
    function balanceOf(ERC20 token) constant returns (uint) {
        assert(msg.sender == owner);
        return token.balanceOf(this);
    }
    
    //initially only the amount that was bought can be sold, so quantity is the same for bid/ask
    function trade(uint bid_id, uint ask_id, uint quantity, ERC20 buying, ERC20 selling, SimpleMarket maker_address) {
        assert(msg.sender == owner);
        var bid_buy_how_much = getBuyAmount(bid_id, maker_address);
        var buy_allowance = buying.allowance(this, maker_market_address);
        if(buy_allowance < bid_buy_how_much) {
            buying.approve(maker_market_address, bid_buy_how_much);
        }
        
        var ask_buy_how_much = getBuyAmount(ask_id, maker_address);
        var sell_allowance = selling.allowance(this, maker_market_address);
        if(sell_allowance < ask_buy_how_much) {
            selling.approve(maker_market_address, ask_buy_how_much);
        }
        
        var askSuccess = maker_market.buyPartial(ask_id, quantity);
        assert(askSuccess);        
        var bidSuccess = maker_market.buyPartial(bid_id, quantity);
        assert(bidSuccess);
    }
    
    function getBuyAmount(uint bid_id, SimpleMarket maker_market) constant returns (uint amount){
        var (sell_how_much, sell_which_token, buy_how_much, buy_which_token) = maker_market.getOffer(bid_id);
        return buy_how_much;
    }
}

contract TraderKeeperMarket is SimpleMarket {}