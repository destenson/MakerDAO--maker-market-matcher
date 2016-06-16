var assert = require('chai').assert;
var expect = require('chai').expect;

function addition(a, b) {
    return a + b;
}

describe('addition', function () {
    it('should return the added values', function () {
        assert.equal(10, addition(4,6));
    });
});

var bidEqualTen = {
        buy_which_token: "ETH",
        sell_which_token: "MKR",
        sell_how_much: 10,
        buy_how_much: 10,
        get ask_price() { this.buy_how_much.div(this.sell_how_much).toNumber()},
        get bid_price() { this.sell_how_much.div(this.buy_how_much).toNumber()}
    }

var bidEqualFive = {
        buy_which_token: "ETH",
        sell_which_token: "MKR",
        sell_how_much: 5,
        buy_how_much: 5,
        get ask_price() { this.buy_how_much.div(this.sell_how_much).toNumber()},
        get bid_price() { this.sell_how_much.div(this.buy_how_much).toNumber()}
    }

var askEqualTen = {
        buy_which_token: "MKR",
        sell_which_token: "ETH",
        sell_how_much: 10,
        buy_how_much: 10,
        get ask_price() { this.buy_how_much.div(this.sell_how_much).toNumber()},
        get bid_price() { this.sell_how_much.div(this.buy_how_much).toNumber()}
    }

var askEqualFive = {
        buy_which_token: "MKR",
        sell_which_token: "ETH",
        sell_how_much: 5,
        buy_how_much: 5,
        get ask_price() { this.buy_how_much.div(this.sell_how_much).toNumber()},
        get bid_price() { this.sell_how_much.div(this.buy_how_much).toNumber()}
    }

var askHalfTen = {
        buy_which_token: "ETH",
        sell_which_token: "MKR",
        sell_how_much: 10,
        buy_how_much: 5,
        get ask_price() { this.buy_how_much.div(this.sell_how_much).toNumber()},
        get bid_price() { this.sell_how_much.div(this.buy_how_much).toNumber()}
    }

function determineTradeAmounts(bidToTrade, askToTrade) {
    //quantity for bid
    //quantity for ask
    
    return bidToTrade.buy_how_much;
}

describe('Determine trade amounts', function() {
    describe('Bid same as Ask', function() {
        it('gets the trade amount from the bid buy_how_much', function() {
            var tradeAmount = determineTradeAmounts(bidEqualTen, askEqualTen)
            expect(tradeAmount).to.equal(10);
        });
        it('Bid/Ask same price but bid has half amount of ask', function() {
            var tradeAmount = determineTradeAmounts(bidEqualFive, askEqualTen)
            expect(tradeAmount).to.equal(5);
        });
        it('Bid/Ask same price but ask has half amount of bid', function() {
            var tradeAmount = determineTradeAmounts(bidEqualTen, askEqualFive)
            expect(tradeAmount).to.equal(5);
        });
        it('Bid/Ask same amount of ETH but ask half the price of bid', function() {
            var tradeAmount = determineTradeAmounts(bidEqualTen, askHalfTen)
            expect(tradeAmount).to.equal(5);
        });
    })
})



