const NotEnoughBalanceError = require('./NotEnoughBalanceError')

module.exports = () => {

  let ordersId = 1
  const orders = {}

  function findMatch({ coin, price }) {
    return Object
      .values(orders)
      .sort((a, b) => a.buy.amount / a.sell.amount - b.buy.amount / b.sell.amount)
      .find(({ buy, sell }) => {
        return sell.coin == coin
          && buy.amount / sell.amount <= price
      })
  }

  function executeOrder(order) {
    const match = findMatch({
      coin: order.buy.coin,
      price: order.sell.amount / order.buy.amount,
    })

    if (!match) {
      return order
    }
    
    if (match.sell.amount > order.buy.amount) {
      const bought = match.buy.amount * order.buy.amount / match.sell.amount
      const sold = order.buy.amount
      match.buy.amount -= bought
      match.sell.amount -= sold
    }
    else if (match.sell.amount < order.buy.amount) {
      const sold = match.sell.amount
      const bought = match.buy.amount
      delete orders[match.id]
      order.buy.amount -= sold
      order.sell.amount -= bought
      return executeOrder(order)
    } else {
      delete orders[match.id]
      delete orders[order.id]
    }
  }

  return {
    findMatch,
    addOrder({ buy, sell }) {
      const remainer = executeOrder({ id: ordersId++, buy, sell })
      if (remainer) {
        return orders[remainer.id] = remainer
      }
    },
    getOrder(id) {
      return orders[id]
    },
  }
}

