import eel
from tinkoff.invest import Client, InstrumentIdType

eel.init('web')

@eel.expose
def get_portfolio():
    token = 'YOUR_TOKEN_T_INVEST'
    with Client(token) as client:
        accounts = client.users.get_accounts()
        if not accounts.accounts:
            return {}
        account_id = accounts.accounts[0].id
        portfolio = client.operations.get_portfolio(account_id=account_id)
        assets_by_type = {
            "stocks": [],
            "bonds": [],
            "etfs": [],
            "currencies": [],
            "others": []
        }
        total_portfolio_value = 0
        total_purchase_value = 0

        for pos in portfolio.positions:
            avg_price = 0
            current_price = 0
            if pos.average_position_price:
                avg_price = pos.average_position_price.units + pos.average_position_price.nano / 1e9
            if pos.current_price:
                current_price = pos.current_price.units + pos.current_price.nano / 1e9

            instrument_response = client.instruments.get_instrument_by(
                id_type=InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
                id=pos.figi
            )
            name = instrument_response.instrument.name if instrument_response.instrument else ''

            balance = pos.quantity.units + pos.quantity.nano / 1e9 if pos.quantity else 0

            total_value = balance * current_price 
            purchase_value = balance * avg_price  

            total_portfolio_value += total_value
            total_purchase_value += purchase_value

            profit_loss = total_value - purchase_value

            asset = {
                'figi': pos.figi,
                'ticker': pos.ticker,
                'name': name,
                'balance': balance,
                'average_price': avg_price,
                'current_price': current_price,
                'total_value': total_value,
                'profit_loss': profit_loss,
                'type': pos.instrument_type
            }

            if pos.instrument_type == 'stock':
                assets_by_type["stocks"].append(asset)
            elif pos.instrument_type == 'bond':
                assets_by_type["bonds"].append(asset)
            elif pos.instrument_type == 'etf':
                assets_by_type["etfs"].append(asset)
            elif pos.instrument_type == 'currency':
                assets_by_type["currencies"].append(asset)
            else:
                assets_by_type["others"].append(asset)

        portfolio_growth = total_portfolio_value - total_purchase_value

        return {
            'assets': assets_by_type,
            'total_value': total_portfolio_value,
            'portfolio_growth': portfolio_growth
        }

if __name__ == '__main__':
    eel.start('index.html', size=(900, 600))
