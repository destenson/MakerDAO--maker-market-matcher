var Web3 = require('web3')
var web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

var dapple = require('./build/js_module.js')
var Dapple = new dapple.class(web3, 'morden')
var sugar = require('sugar')
console.log('keeper started')

var offers = []
var bids = []
var asks = []
//get this from config file
var trade_gas_costs = 0

startKeeper()

function startKeeper() {
    Dapple.objects.otc.last_offer_id(function (error, result) {
        if(!error) {
            var id = result.toNumber()
            console.log(id)
            if(id > 0) {
                synchronizeOffer(id, id)
                watchForUpdates()
                trade()
            }
        }
        else {
            console.log(error)
        }
    })  
}

function watchForUpdates() {
    Dapple.objects.otc.ItemUpdate(function (error, result) {
        if(!error) {
            console.log(result)
            var id = result.args.id.toNumber()
            synchronizeOffer(id)
            trade()
        }
    })
}

function synchronizeOffer(offer_id, max) {
    Dapple.objects.otc.offers(offer_id, function (error, data) {
        if(!error) {
            console.log(data)
            var sell_how_much = data[0]
            var sell_which_token = formattedString(data[1])
            var buy_how_much = data[2]
            var buy_which_token = formattedString(data[3])
            var owner = data[4]
            var active = data[5]
            if(active) {
                updateOffer(offer_id, sell_how_much, sell_which_token, buy_how_much, buy_which_token, owner)
            }
            else {
                removeOffer(offer_id, sell_which_token);
            }
        }
        else {
            console.log(error)
        }
        if(max > 0 && offer_id > 1) {
            synchronizeOffer(offer_id - 1, offer_id)
        }
        else {
            sortOffers()            
            showActiveOffers()
        }
    })
}

function trade() {
    if(bids[0].bid_price > asks[0].ask_price + trade_gas_costs) {
        //call contract
    }
}

function sortOffers() {
    //sort for the highest bid prices
    bids.sort(function(a,b) {
        return b.bid_price - a.bid_price
    })
    
    //sort for the lowest ask price
    asks.sort(function(a,b) {
        return a.ask_price - b.ask_price 
    })
}

function showActiveOffers() {
    console.log('Bids')
    bids.forEach(function(offer) {
        console.log('offer id: ' + offer.id + ' sell_token: ' + offer.sell_which_token + ' sell_how_much: ' + offer.sell_how_much
        + ' buy_token: ' + offer.buy_which_token + ' buy_how_much: ' + offer.buy_how_much + ' ask_price: ' + offer.ask_price
        + ' bid_price: ' + offer.bid_price)
    })
    console.log('Asks')
    asks.forEach(function(offer) {
        console.log('offer id: ' + offer.id + ' sell_token: ' + offer.sell_which_token + ' sell_how_much: ' + offer.sell_how_much
        + ' buy_token: ' + offer.buy_which_token + ' buy_how_much: ' + offer.buy_how_much + ' ask_price: ' + offer.ask_price
        + ' bid_price: ' + offer.bid_price)
    })
}

function updateOffer(id, sell_how_much, sell_which_token, buy_how_much, buy_which_token, owner) {
    var newOffer = {
        id: id,
        owner: owner,
        buy_which_token: buy_which_token,
        sell_which_token: sell_which_token,
        sell_how_much: sell_how_much.toString(10),
        buy_how_much: buy_how_much.toString(10),
        ask_price: buy_how_much.div(sell_how_much).toNumber(),
        bid_price: sell_how_much.div(buy_how_much).toNumber()
    }
    
    if(sell_which_token === 'ETH') {
        var currentOffer = asks.find(function(offer) {
            return offer.id === newOffer.id
        })
        
        if(currentOffer == null) {
            asks.add(newOffer)    
        }
        else
        {
            currentOffer.buy_how_much = buy_how_much.toString(10)
            currentOffer.sell_how_much = sell_how_much.toString(10)
            currentOffer.ask_price = buy_how_much.div(sell_how_much).toNumber()
            currentOffer.bid_price = sell_how_much.div(buy_how_much).toNumber()
        }
    }
    else if(sell_which_token === 'MKR') {
        var currentOffer = bids.find(function(offer) {
            return offer.id === newOffer.id
        })
        
        if(currentOffer == null) {
            bids.add(newOffer)    
        }
        else
        {
            currentOffer.buy_how_much = buy_how_much.toString(10)
            currentOffer.sell_how_much = sell_how_much.toString(10)
            currentOffer.ask_price = buy_how_much.div(sell_how_much).toNumber()
            currentOffer.bid_price = sell_how_much.div(buy_how_much).toNumber()
        }
    }
    
}

function removeOffer(offer_id, sell_which_token) {
    if(sell_which_token === 'ETH') {
        asks.remove(function(offer) { return offer.id === offer_id})
    }
    else if(sell_which_token === 'MKR') {
        bids.remove(function(offer) { return offer.id === offer_id})
    }
}

function formattedString (str) {
  return web3.toAscii(str).replace(/\0[\s\S]*$/g, '').trim()
}