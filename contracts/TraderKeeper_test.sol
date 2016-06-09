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
    
    function doOffer(uint sell_how_much, bytes32 sell_which_token, uint buy_how_much, bytes32 buy_which_token) {
        market.offer(sell_how_much, sell_which_token, buy_how_much, buy_which_token);
    }
    
    function doWithdraw(ERC20 token, uint token_amount, TraderKeeper keeper) {
        keeper.withdraw(token, token_amount);
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
        
        keeper = new TraderKeeper(simple_market);
       
        token1.transfer(keeper, initial_balance_keeper_t1);
        token2.transfer(keeper, initial_balance_keeper_t2);
        
        //create bids and asks
        buyer.doOffer(100, token1, 500, token2);
        seller.doOffer(1000, token2, 100, token1);
    }
    
    function testSetUp() {
        assertEq(token1.balanceOf(keeper), initial_balance_keeper_t1);
        assertEq(token2.balanceOf(keeper), initial_balance_keeper_t2);
        assertEq(token1.balanceOf(buyer), initial_balance_buyer_t1);
        assertEq(token1.balanceOf(seller), initial_balance_seller_t1);
        assertEq(token2.balanceOf(buyer), initial_balance_buyer_t2);
        assertEq(token2.balanceOf(seller), initial_balance_seller_t2);
    }
    
    function testDeposit() {
        uint deposit_amount = 300;
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
        keeper.withdraw(token2, withdraw_amount);
    }
    
    function testIsOwnerFail() {
        buyer.doWithdraw(token1, 100, keeper);
    }
    
    function testTrade() {
        keeper.trade(1, 1, token1, token 2);
    }
    
    function testFailTradeBuy() {
        keeper.trade(0, 1, token1, token2);
    }
    
    function testFailTradeSell() {
        keeper.trade(1, 0, token1, token2);
    }
    
    function testFailTradeInsufficientAllowance() {
    }
    
    function testFailTradeInsufficientBalance() {
        keeper.withdraw(initial_balance_keeper_t1);
        keeper.trade(1, 2, token1, token2);
    }
}