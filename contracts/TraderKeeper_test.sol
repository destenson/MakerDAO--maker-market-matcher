import 'dapple/test.sol';
import 'TraderKeeper.sol';
import 'erc20/base.sol';
import 'maker-otc/simple_market.sol';
import 'maker-otc/assertive.sol';

contract KeeperTester is Tester {
    SimpleMarket market;
    
    function KeeperTester(SimpleMarket simpleMarket) {
        market = simpleMarket;
    }
    
    function doApprove(ERC20 which_token, uint amount) constant returns (bool ok) {
        return which_token.approve(market, amount);
    }
    
    function doOffer(uint sell_how_much, ERC20 sell_which_token, uint buy_how_much, ERC20 buy_which_token) returns (uint id) {
        return market.offer(sell_how_much, sell_which_token, buy_how_much, buy_which_token);
    }
    
    function doWithdraw(ERC20 token, uint token_amount, TraderKeeper keeper) {
        keeper.withdraw(token, token_amount);
    }
    
    function getOffer(uint id) constant returns (uint sell_how_much, ERC20 sell_which_token, uint buy_how_much, ERC20 buy_which_token) {
        return market.getOffer(id);
    }
}

contract TraderKeeperTest is Test {
    TraderKeeper keeper;
    KeeperTester buyer;
    KeeperTester seller;
    ERC20 token1;
    ERC20 token2;
    SimpleMarket simple_market;
    
    uint constant initial_balance_t1 = 10000;
    uint constant initial_balance_t2 = 50000;
    uint constant initial_balance_keeper_t1 = 5000;
    uint constant initial_balance_keeper_t2 = 20000;
    uint constant initial_balance_buyer_t1 = 2000;
    uint constant initial_balance_buyer_t2 = 10000;
    uint constant initial_balance_seller_t1 = 2000;
    uint constant initial_balance_seller_t2 = 10000;
    uint constant buyer_token1_bid = 100;
    uint constant seller_token2_ask = 1000;
    uint bid_id_first;
    uint ask_id_first;
    
    function setUp() {
        simple_market = new SimpleMarket();
        buyer = new KeeperTester(simple_market);
        seller = new KeeperTester(simple_market); 
        
        token1 = new ERC20Base(initial_balance_t1);
        token2 = new ERC20Base(initial_balance_t2);
        
        token1.transfer(buyer, initial_balance_buyer_t1);
        token1.transfer(seller, initial_balance_seller_t1);
        token2.transfer(buyer, initial_balance_buyer_t2);
        token2.transfer(seller, initial_balance_seller_t2);
        
        keeper = new TraderKeeper();
       
        token1.transfer(keeper, initial_balance_keeper_t1);
        token2.transfer(keeper, initial_balance_keeper_t2);
        token1.approve(simple_market, initial_balance_keeper_t1);
        token2.approve(simple_market, initial_balance_keeper_t2);
        //keeper.approve(token1, initial_balance_keeper_t1, simple_market);
        //keeper.approve(token2, initial_balance_keeper_t2, simple_market);
        
        //create bids and asks        
        buyer.doApprove(token1, initial_balance_buyer_t1);
        buyer.doApprove(token2, initial_balance_buyer_t2);
        seller.doApprove(token1, initial_balance_seller_t1);
        seller.doApprove(token2, initial_balance_seller_t2);
        bid_id_first = buyer.doOffer(buyer_token1_bid, token1, 500, token2);
        ask_id_first = seller.doOffer(seller_token2_ask, token2, 100, token1);
    }
    
    function testSetUp() {
        assertEq(buyer.doApprove(token1, buyer_token1_bid), true);
        assertEq(seller.doApprove(token2, seller_token2_ask), true);
        assertEq(token1.approve(simple_market, initial_balance_keeper_t1), true);
        assertEq(token2.approve(simple_market, initial_balance_keeper_t2), true);
        assertEq(token1.balanceOf(keeper), initial_balance_keeper_t1);
        assertEq(token2.balanceOf(keeper), initial_balance_keeper_t2);
        assertEq(token1.balanceOf(buyer), initial_balance_buyer_t1 - buyer_token1_bid);
        assertEq(token1.balanceOf(seller), initial_balance_seller_t1);
        assertEq(token2.balanceOf(buyer), initial_balance_buyer_t2);
        assertEq(token2.balanceOf(seller), initial_balance_seller_t2 - seller_token2_ask);
        assertEq(bid_id_first, 1);
        assertEq(ask_id_first, 2);
        
        var (a,b,c,d) = buyer.getOffer(1);
        assertEq(c, 500);
    }
    
    function testDeposit() {
        uint deposit_amount = 300;
        token1.approve(keeper, deposit_amount);
        keeper.deposit(token1, deposit_amount);
        assertEq(token1.balanceOf(keeper), initial_balance_keeper_t1 + deposit_amount);
    }
    
    function testFailDepositInsufficientFunds() {
        uint deposit_amount = 10000000;
        keeper.deposit(token1, deposit_amount);
    }
    
    function testWithdraw() {
        uint withdraw_amount = 500;
        keeper.withdraw(token2, withdraw_amount);
        assertEq(token2.balanceOf(keeper), initial_balance_keeper_t2 - withdraw_amount);
    }
    
    function testFailWithdrawInsufficientFunds() {
        uint withdraw_amount = 1000000;
        keeper.withdraw(token2, initial_balance_keeper_t2 * 100);
    }
    
    function testFailIsOwner() {
        buyer.doWithdraw(token1, 100, keeper);
    }   
    
    function testTrade() {
        keeper.trade(bid_id_first, ask_id_first, 100, token2, token1, simple_market);
    }
    
    function testFailTradeBuy() {
        keeper.trade(0, ask_id_first, 100, token2, token1, simple_market);
    }
    
    function testFailTradeSell() {
        keeper.trade(bid_id_first, 0, 100, token2, token1, simple_market);
    }
    
    function testFailInsufficientBalance() {
        keeper.withdraw(token2, initial_balance_keeper_t2);
        assertEq(token2.balanceOf(keeper), 0);
        keeper.trade(bid_id_first, ask_id_first, 10, token1, token2, simple_market);
    }
}