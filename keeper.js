var Web3 = require('web3')
var web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))
web3.eth.defaultAccount = web3.eth.accounts[0];

var dapple = require('./build/js_module.js')
var Dapple = new dapple.class(web3, 'morden')
var sugar = require('sugar')
var config = require('./config.global.js')

var offers = []
var bids = []
var asks = []

//TODO Check arguments whether to start keeper, deposit/withdraw tokens or check the balance

//startKeeper()
showBalance();


function showBalance() {
    Dapple.objects.matcher.balanceOf(config.ERC20.ETH, function(error, result) {
        if(!error) {
            console.log('ETH balance: ', result.toString());
        } 
        else {
            console.log('Error: ', error);
        }
    });
    Dapple.objects.matcher.balanceOf(config.ERC20.MKR, function(error, result) {
        if(!error) {
            console.log('MKR balance: ', result.toString());
        } 
        else {
            console.log('Error: ', error);
        }
    });
}

function startKeeper() {
    console.log('keeper started')
    Dapple.objects.otc.last_offer_id(function (error, result) {
        if(!error) {
            var id = result.toNumber()
            console.log(id)
            if(id > 0) {
                synchronizeOffer(id, id)
                console.log('is synchronize offers finished?')
                
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
function printData(offer_id, data) {
    console.log('id: ' + offer_id + ' sell token: ' + data[1] + ' sell how much: ' + data[0] + ' ' + data[3] + ' buy how much: ' + data[2] + ' ' + data[5])
}

function synchronizeOffer(offer_id, max) {
    Dapple.objects.otc.offers(offer_id, function (error, data) {
        if(!error) { 
            var sell_how_much = data[0]
            var sell_which_token = data[1]
            var buy_how_much = data[2]
            var buy_which_token = data[3]
            var owner = data[4]
            var active = data[5]
            if(active) {
                //printData(offer_id, data)
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
            console.log('time to sort the offers')
            sortOffers()            
            showActiveOffers()
            //watchForUpdates()
            //trade()
        }
    })
}

function trade() {
    if(bids[0] != null && asks[0] != null && bids[0].price > asks[0].price + config.trade_gas_costs) {
        console.log('Call trade: ', bids[0].id, asks[0].id, bids[0].buy_how_much, bids[0].buy_which_token, bids[0].sell_which_token, Dapple.objects.matcher.address)
        
        //TODO Use promise
        Dapple.objects.matcher.balanceOf(config.ERC20.ETH, function(error, data) {
            if(!error) {
                var balance = data.toNumber()
                var minimum_ask_bid = min(bids[0].buy_how_much, asks[0].sell_how_much)
                var amount_before_balance = minimum_ask_bid * asks[0].price
                var minimum_balance_amount = min(balance, amount_before_balance)
                var ask_quantity = minimum_ask_bid * (minimum_balance_amount / amount_before_balance)
                
                var bid_quantity = ask_quantity * bids[0].price
                
                Dapple.objects.matcher.trade(bids[0].id, asks[0].id, bid_quantity, ask_quantity, bids[0].buy_which_token, bids[0].sell_which_token, Dapple.objects.matcher.address, {gas: config.trade_gas_costs }, function(fail, result) {
                    if(!fail) {
                        console.log(result)
                    }
                    else {
                        console.log(fail)
                    }
                })
            }
            else {
                console.log(error)
            }
        })
    }
}

function min(a, b) {
    if (a < b) {
        return a    
    } 
    else {
        return b
    }
}

function sortOffers() {
    //sort for the highest bid prices
    bids.sort(function(a,b) {
        return b.price - a.price
    })
    
    //sort for the lowest ask price
    asks.sort(function(a,b) {
        return a.price - b.price 
    })
}

function showActiveOffers() {
    console.log('Bids')
    bids.forEach(function(offer) {
        console.log('offer id: ' + offer.id + ' sell_token: ' + offer.sell_which_token + ' sell_how_much: ' + offer.sell_how_much
        + ' buy_token: ' + offer.buy_which_token + ' buy_how_much: ' + offer.buy_how_much + ' ask_price: ' + offer.price
        + ' bid_price: ' + offer.price)
    })
    console.log('Asks')
    asks.forEach(function(offer) {
        console.log('offer id: ' + offer.id + ' sell_token: ' + offer.sell_which_token + ' sell_how_much: ' + offer.sell_how_much
        + ' buy_token: ' + offer.buy_which_token + ' buy_how_much: ' + offer.buy_how_much + ' ask_price: ' + offer.price
        + ' bid_price: ' + offer.price)
    })
}

function updateOffer(id, sell_how_much, sell_which_token, buy_how_much, buy_which_token, owner) {
    var price = 0
    if(sell_which_token == config.ERC20.ETH) {
        price = sell_how_much.div(buy_how_much).toNumber()
    }
    else if(sell_which_token == config.ERC20.MKR) {
        price = buy_how_much.div(sell_how_much).toNumber()
    }
    
    var newOffer = {
        id: id,
        owner: owner,
        buy_which_token: buy_which_token,
        sell_which_token: sell_which_token,
        sell_how_much: sell_how_much.toString(10),
        buy_how_much: buy_how_much.toString(10),
        price: price
    }
    
    if(sell_which_token == config.ERC20.ETH && buy_which_token == config.ERC20.MKR) {
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
            currentOffer.price = newOffer.price
        }
    }
    else if(sell_which_token == config.ERC20.MKR && buy_which_token == config.ERC20.ETH) {
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
            currentOffer.price = newOffer.price
        }
    }
    else {
        //console.log(sell_which_token)
    }
}

function removeOffer(offer_id, sell_which_token) {
    if(sell_which_token == config.ERC20.ETH) {
        asks.remove(function(offer) { return offer.id === offer_id})
    }
    else if(sell_which_token == config.ERC20.MKR) {
        bids.remove(function(offer) { return offer.id === offer_id})
    }
}

function formattedString (str) {
    return web3.toAscii(str).replace(/\0[\s\S]*$/g, '').trim()
}