import 'dapple/test.sol';
import 'TraderKeeper.sol';
import 'erc20/base.sol';

contract TraderKeeperTest is Test {
    TraderKeeper keeper;
    Tester proxy_tester;
    ERC20 t1;
    ERC20 t2;
    
    uint constant T1 = 1000;
    uint constant T2 = 5000;
    
    
    function setUp() {
        keeper = new TraderKeeper();
        
        var million = 10 ** 6;
        t1 = new ERC20Base(T1);
        t2 = new ERC20Base(T2);
        
        t1.transfer(keeper, T1);
        t2.transfer(keeper, T2);
        
    }
    
    function testSetUp() {
        assertEq(t1.balanceOf(keeper), T1);
        assertEq(t2.balanceOf(keeper), T2);
    }
    
    function testDeposit() {
        uint deposit_amount = 12345;
        keeper.deposit(t1, deposit_amount);
        assertEq(t1.balanceOf(keeper), T1 + deposit_amount);
    }
    
    function testWithdraw() {
        uint withdraw_amount = 500;
        keeper.withdraw(t2, withdraw_amount);
        assertEq(t2.balanceOf(keeper), T2 - withdraw_amount);
    }
    
    function testFailWithdraw() {
        uint withdraw_amount = 10000;
        keeper.withdraw(t2, withdraw_amount);
        assertEq(t2.balanceOf(keeper), withdraw_amount);
    }
    
    function testIsOwnerFail() {
        
    }
    
    function testTrade() {
        
    }
    
    function testFailTradeBuy() {
        
    }
    
    function testFailTradeSell() {
        
    }
    
    function testFailTradeInsufficientAllowance() {
        
    }
    
    function testFailTradeInsufficientBalance() {
        
    }
}