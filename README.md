Sorry, I couldn't understand how that grapes library works, I didn't find a way to know the amount of clients connected to a server.
But the idea is to have several clients an one server

+---------+      +---------+      +---------+
| Client1 |      | Client2 |      | Client3 |
+---------+      +---------+      +---------+


                 +---------+
                 | Server  |
                 +---------+


When one client wants to create an order it sends a message to the server:

{
  type: 'NEW_ORDER':
  payload: {
    order: {
      id: 123,
      clientId: 1,
      buy: {
        coin: 'BTC',
        amount: '0.01',
      },
      sell: {
        coin: 'USDC',
        amount: '100',
      }
    }
  }
}

The server receives the message and send it to all the clients.
Every client will search if there is a match on their orderbook.
If there is no match the client will send a no match message to the server.
For example if there is no match on the client 3 it will send this message

{
  type: 'NO_MATCH':
  payload: {
    order: {
      id: 123,
      clientId: 1,
      buy: {
        coin: 'BTC',
        amount: '0.01',
      },
      sell: {
        coin: 'USDC',
        amount: '100',
      }
    },
    match: {
      clientId: 3,
    }
  }
}


If there is a match in the clients then the matcher clients will send a match message to the server:
For example, if the client 2 has a match it will send its order as a match:

{
  type: 'MATCH':
  payload: {
    order: {
      id: 123,
      clientId: 1,
      buy: {
        coin: 'BTC',
        amount: '0.01',
      },
      sell: {
        coin: 'USDC',
        amount: '100',
      }
    },
    match: {
      id: 567,
      clientId: 3,
      buy: {
        coin: 'USDC',
        amount: '100',
      },
      sell: {
        coin: 'BTC',
        amount: '0.01',
      }
    }
  }
}

The server will wait for all the client response or for a timeout.
Once the server has all the MATCH/NO_MATCH responses it searches the best match from all the responses and send the selected choice to all the clients.
For example, if the client 2 is selected the the server will respond:

{
  type: 'PROCESS':
  payload: {
    order: {
      id: 123,
      clientId: 1,
      buy: {
        coin: 'BTC',
        amount: '0.01',
      },
      sell: {
        coin: 'USDC',
        amount: '100',
      }
    },
    match: {
      id: 567,
      clientId: 3,
      buy: {
        coin: 'USDC',
        amount: '100',
      },
      sell: {
        coin: 'BTC',
        amount: '0.01',
      }
    }
  }
}

When the client receives the response the client will check if the payload.match.clientId matches with its own clientId,
If it does not match then the client will ignore this message.
If the clientId matches then the client will process the order and if there is a remainder the client will send a NEW_ORDER with the remainer to be processed again


If all the clients responds with a NO_MATCH message then the server will send the ADD_ORDER message to all the clients

{
  type: 'ADD_ORDER':
  payload: {
    order: {
      id: 123,
      clientId: 1,
      buy: {
        coin: 'BTC',
        amount: '0.01',
      },
      sell: {
        coin: 'USDC',
        amount: '100',
      }
    }
  }
}

This message will be ignored by all the clients except by client1 because payload.order.clientId is 1
In this case the client1 will add the order to its orderbook
