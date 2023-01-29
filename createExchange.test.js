const { expect } = require('chai')

const createExchange = require('./createExchange')

describe('Orders', function () {

  it('should add an order if there is no match', function () {
    const exchange = createExchange()
    const orderData = {
      buy: {
        coin: 'BTC',
        amount: 0.01,
      },
      sell: {
        coin: 'USDC',
        amount: 100,
      }
    }
    const { id } = exchange.addOrder(orderData)
    const order = exchange.getOrder(id)
    expect(order).to.deep.equal({
      ...orderData,
      id: order.id,
    })
  })

  it('should execute an order if there is a full match', function () {
    const exchange = createExchange()

    const { id: orderId1 } = exchange.addOrder({
      sell: { amount: 100, coin: 'USDC' },
      buy: { amount: 0.01, coin: 'BTC' },
    })

    const order2 = exchange.addOrder({
      buy: { amount: 60, coin: 'USDC' },
      sell: { amount: 0.01, coin: 'BTC' },
    })

    const order1 = exchange.getOrder(orderId1)
    expect(order1).to.deep.equal({
      id: orderId1,
      sell: { amount: 40, coin: 'USDC' },
      buy: { amount: 0.004, coin: 'BTC' },
    })

    expect(order2).to.equal(undefined)
  })

  it('should execute an order if there is a partial match', function () {
    const exchange = createExchange()

    const { id: orderId1 } = exchange.addOrder({
      sell: { amount: 100, coin: 'USDC' },
      buy: { amount: 0.01, coin: 'BTC' },
    })

    const { id: orderId2 } = exchange.addOrder({
      buy: { amount: 150, coin: 'USDC' },
      sell: { amount: 0.1, coin: 'BTC' },
    })

    const order1 = exchange.getOrder(orderId1)
    expect(order1).to.equal(undefined)

    const order2 = exchange.getOrder(orderId2)
    expect(order2).to.deep.equal({
      id: orderId2,
      buy: { amount: 50, coin: 'USDC' },
      sell: { amount: 0.1 - 0.01, coin: 'BTC' },
    })
  })

  it('should not execute the order if the price does not match', function () {
    const exchange = createExchange()

    const { id: orderId1 } = exchange.addOrder({
      sell: { amount: 100, coin: 'USDC' },
      buy: { amount: 0.01, coin: 'BTC' },
    })

    const { id: orderId2 } = exchange.addOrder({
      buy: { amount: 100, coin: 'USDC' },
      sell: { amount: 0.001, coin: 'BTC' },
    })

    const order1 = exchange.getOrder(orderId1)
    expect(order1).to.deep.equal({
      id: orderId1,
      sell: { amount: 100, coin: 'USDC' },
      buy: { amount: 0.01, coin: 'BTC' },
    })

    const order2 = exchange.getOrder(orderId2)
    expect(order2).to.deep.equal({
      id: orderId2,
      buy: { amount: 100, coin: 'USDC' },
      sell: { amount: 0.001, coin: 'BTC' },
    })
  })

  it('should execute an order if there is an exact match', function () {
    const exchange = createExchange()

    const { id: orderId1 } = exchange.addOrder({
      sell: { amount: 100, coin: 'USDC' },
      buy: { amount: 0.01, coin: 'BTC' },
    })

    const order2 = exchange.addOrder({
      buy: { amount: 100, coin: 'USDC' },
      sell: { amount: 0.01, coin: 'BTC' },
    })

    const order1 = exchange.getOrder(orderId1)
    expect(order1).to.equal(undefined)
    expect(order2).to.equal(undefined)
  })

  it('should execute an order if there are more than one order to match', function () {
    const exchange = createExchange()

    const { id: orderId1 } = exchange.addOrder({
      sell: { amount: 50, coin: 'USDC' },
      buy: { amount: 0.015, coin: 'BTC' },
    })

    const { id: orderId2 } = exchange.addOrder({
      sell: { amount: 40, coin: 'USDC' },
      buy: { amount: 0.01, coin: 'BTC' },
    })

    const order3 = exchange.addOrder({
      buy: { amount: 60, coin: 'USDC' },
      sell: { amount: 0.02, coin: 'BTC' },
    })

    const order1 = exchange.getOrder(orderId1)
    expect(order1).to.deep.equal({
      id: orderId1,
      sell: { amount: 50 - 20, coin: 'USDC' },
      buy: { amount: 0.015 - 0.006, coin: 'BTC' },
    })

    const order2 = exchange.getOrder(orderId2)
    expect(order2).to.equal(undefined)

    expect(order3).to.equal(undefined)
  })

});
