export enum INFO {
  FIRST_CONNECT_METAMASK = 'Connect to MetaMask first!',
}

export enum ERROR {
  INVALID_ADDRESS = 'This address is not a valid address!',
  MISSING_AMOUNT = 'Please input an amount!',
  MISSING_RECEIVING_SUBNET = 'Please select the receiving subnet!',
  MISSING_RECIPIENT_ADDRESS = 'Please input the address of the recipient!',
  MISSING_SENDING_SUBNET = 'Please select a sending subnet!',
  MISSING_TOKEN = 'Please select a token!',
  MISSING_TOKEN_NAME_FOR_REGISTER = 'Please input the name of the token!',
  MISSING_TOKEN_SYMBOL_FOR_REGISTER = 'Please input the symbol of the token!',
  MISSING_TOKEN_SUPPLY_FOR_REGISTER = 'Please input the supply of the token!',
  MISSING_TOKEN_CAP_FOR_REGISTER = 'Please input the cap of the token!',
  MISSING_TOKEN_DAILY_MINT_FOR_REGISTER = 'Please input the daily mint limit of the token!',
  TOKEN_WITH_SYMBOL_ALREADY_EXIST = 'A token with the provided symbol already exists!',
}

export enum SUCCESS {
  REGISTERED_TOKEN = 'The token has been successfully registered!',
}
