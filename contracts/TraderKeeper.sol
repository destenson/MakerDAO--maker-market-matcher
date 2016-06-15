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
    function trade(uint bid_id, uint ask_id, uint quantity, ERC20 buying, ERC20 selling, address maker_address) {
        SimpleMarket maker_market = SimpleMarket(maker_address);
        address maker_market_address = maker_address;
        assert(msg.sender == owner);
        var buy_allowance = buying.allowance(this, maker_market_address);
        if(buy_allowance < 500) {
            buying.approve(maker_market_address, 1000);
        }
        var sell_allowance = selling.allowance(this, maker_market_address);
        if(sell_allowance < 500) {
            selling.approve(maker_market_address, 1000);
        }
        
        //var (a, b, c, d) = maker_market.getOffer(bid_id);
        
        var askSuccess = maker_market.buyPartial(ask_id, quantity);
        assert(askSuccess);        
        var bidSuccess = maker_market.buyPartial(bid_id, quantity);
        assert(bidSuccess);
    }
    
    function getBuyAmount(uint bid_id) returns (uint amount){
        address maker_adres = 0x5661e7bc2403c7cc08df539e4a8e2972ec256d11;
        SimpleMarket maker_market = SimpleMarket(maker_adres);
        var (a, b, c, d) = maker_market.getOffer(bid_id);
        return c;
    }
}

contract TraderKeeperMarket is SimpleMarket {}