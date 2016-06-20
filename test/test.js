var assert = require('chai').assert;
var expect = require('chai').expect;

var bidTenFourty = {
    buy_which_token: "MKR",
    sell_which_token: "ETH",
    sell_how_much: 40,
    buy_how_much: 10,
    price: 4
}

var bidFiveTwenty = {
    buy_which_token: "MKR",
    sell_which_token: "ETH",
    sell_how_much: 20,
    buy_how_much: 5,
    price: 4
}

var askTwentyTen = {
    buy_which_token: "ETH",
    sell_which_token: "MKR",
    sell_how_much: 10,
    buy_how_much: 20,
    price: 2
}

var askTenFive = {
    buy_which_token: "ETH",
    sell_which_token: "MKR",
    sell_how_much: 5,
    buy_how_much: 10,
    price: 2
}

function getAskQuantity(bid, ask, balance) {
    var minimumOfAskAndBid = min(bid.buy_how_much, ask.sell_how_much);
    var amountBeforeBalance = minimumOfAskAndBid * ask.price;
    var minimumOfBalanceAndAmount = min(balance, amountBeforeBalance);
    var askQuantity = minimumOfAskAndBid * (minimumOfBalanceAndAmount / amountBeforeBalance);
    return askQuantity;
}

function getBidQuantity(bid, ask, balance) {
    var askQuantity = getAskQuantity(bid, ask, balance);
    return askQuantity * bid.price;
}

function min(a, b) {
    if (a < b) {
        return a;    
    } 
    else {
        return b;
    }
  }

describe('Determine trade amounts', function() {
    describe('Calculate the correct amount to buy from both the bid and the ask', function() {
        it('Equal amount ask, bid and sufficient balance', function() {
            var balance = 20;
            var askQuantity = getAskQuantity(bidTenFourty, askTwentyTen, balance);
            expect(askQuantity).to.equal(10);
            var bidQuantity = getBidQuantity(bidTenFourty, askTwentyTen, balance);
            expect(bidQuantity).to.equal(40);
        });
        it('Equal amount ask, bid and insufficient balance', function() {
            var balance = 10;
            var askQuantity = getAskQuantity(bidTenFourty, askTwentyTen, balance);
            expect(askQuantity).to.equal(5);
            var bidQuantity = getBidQuantity(bidTenFourty, askTwentyTen, balance);
            expect(bidQuantity).to.equal(20);
        });
        it('Half the amount bid of ask and sufficient balance', function() {
            var balance = 10;
            var askQuantity = getAskQuantity(bidFiveTwenty, askTwentyTen, balance);
            expect(askQuantity).to.equal(5);
            var bidQuantity = getBidQuantity(bidFiveTwenty, askTwentyTen, balance);
            expect(bidQuantity).to.equal(20);
        });
        it('Half the amount bid of ask and insufficient balance', function() {
            var balance = 8;
            var askQuantity = getAskQuantity(bidFiveTwenty, askTwentyTen, balance);
            expect(askQuantity).to.equal(4);
            var bidQuantity = getBidQuantity(bidFiveTwenty, askTwentyTen, balance);
            expect(bidQuantity).to.equal(16);
        });
        it('Half the amount ask of bid and sufficient balance', function() {
            var balance = 10;
            var askQuantity = getAskQuantity(bidTenFourty, askTenFive, balance);
            expect(askQuantity).to.equal(5);
            var bidQuantity = getBidQuantity(bidTenFourty, askTenFive, balance);
            expect(bidQuantity).to.equal(20);
        });
        it('Half the amount ask of bid and insufficient balance', function() {
            var balance = 8;
            var askQuantity = getAskQuantity(bidTenFourty, askTenFive, balance);
            expect(askQuantity).to.equal(4);
            var bidQuantity = getBidQuantity(bidTenFourty, askTenFive, balance);
            expect(bidQuantity).to.equal(16);
        });
    })
})



