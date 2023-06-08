import {
  DEFAULT_TOKEN_CAP,
  DEFAULT_TOKEN_DAILY_MINT_LIMIT,
  DEFAULT_TOKEN_SUPPLY,
} from '../../src/constants/defaults'
import { ERROR, SUCCESS } from '../../src/constants/wordings'

describe('Multistep form step-1 with Topos', () => {
  before(() => {
    cy.visit('/')
    cy.get('#connectButton').click()
    cy.acceptMetamaskAccess()
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Topos').click()
    cy.get('#nextButton').click()
  })

  beforeEach(() => {
    cy.visit('/')
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Topos').click()
    cy.get('#nextButton').click()
  })

  it('should have token field enabled and others disabled', () => {
    cy.get('#token').should('not.be.disabled')
    cy.get('#receivingSubnet').should('be.disabled')
    cy.get('#recipientAddress').should('be.disabled')
    cy.get('#amount').should('be.disabled')
    cy.get('#nextButton').should('be.disabled')
  })

  it('should have sending subnet in summary', () => {
    cy.get('#summary0SendingSubnet').should('have.text', 'Topos')
  })

  it('should go back to prev step when click on prev', () => {
    cy.get('#prevButton').click()
    cy.get('#token').should('not.exist')
    cy.get('#receivingSubnet').should('not.exist')
    cy.get('#recipientAddress').should('not.exist')
    cy.get('#amount').should('not.exist')
    cy.get('#summary0SendingSubnet').should('not.exist')
    cy.get('#sendingSubnet').should('exist')
  })

  it('should show empty token list and registration button when click on select', () => {
    cy.get('#token').click()
    cy.get('#token_list').should('have.text', 'No data')
    cy.get('#registerTokenButton').should('be.visible')
  })

  it('should show token registration form when click on registration button', () => {
    cy.get('#token').click()
    cy.get('#registerTokenButton').click()
    cy.get('#form_in_modal_name').should('be.visible').and('not.be.disabled')
    cy.get('#form_in_modal_symbol').should('be.visible').and('not.be.disabled')
    cy.get('#form_in_modal_supply')
      .should('be.visible')
      .and('not.be.disabled')
      .and('have.value', DEFAULT_TOKEN_SUPPLY)
    cy.get('#form_in_modal_cap')
      .should('be.visible')
      .and('not.be.disabled')
      .and('have.value', DEFAULT_TOKEN_CAP)
    cy.get('#form_in_modal_dailyMintLimit')
      .should('be.visible')
      .and('not.be.disabled')
      .and('have.value', DEFAULT_TOKEN_DAILY_MINT_LIMIT)
    cy.get('#cancelButton').should('be.visible').and('not.be.disabled')
    cy.get('#registerButton').should('be.visible').and('not.be.disabled')
  })

  it('should hide token registration form when click on cancel', () => {
    cy.get('#token').click()
    cy.get('#registerTokenButton').click()
    cy.get('#cancelButton').click()
    cy.get('#form_in_modal_name').should('not.exist')
  })

  it('should invalidate the token registration form when missing required fields', () => {
    cy.get('#token').click()
    cy.get('#registerTokenButton').click()
    cy.get('#registerButton').click()
    cy.get('#form_in_modal_name')
      .parents('.ant-form-item')
      .should('have.class', 'ant-form-item-has-error')
    cy.get('#form_in_modal_name_help').should(
      'have.text',
      ERROR.MISSING_TOKEN_NAME_FOR_REGISTER
    )
    cy.get('#form_in_modal_symbol')
      .parents('.ant-form-item')
      .should('have.class', 'ant-form-item-has-error')
    cy.get('#form_in_modal_symbol_help').should(
      'have.text',
      ERROR.MISSING_TOKEN_SYMBOL_FOR_REGISTER
    )
    cy.get('#form_in_modal_supply').clear()
    cy.get('#form_in_modal_supply')
      .parents('.ant-form-item')
      .should('have.class', 'ant-form-item-has-error')
    cy.get('#form_in_modal_supply_help').should(
      'have.text',
      ERROR.MISSING_TOKEN_SUPPLY_FOR_REGISTER
    )
    cy.get('#form_in_modal_cap').clear()
    cy.get('#form_in_modal_cap')
      .parents('.ant-form-item')
      .should('have.class', 'ant-form-item-has-error')
    cy.get('#form_in_modal_cap_help').should(
      'have.text',
      ERROR.MISSING_TOKEN_CAP_FOR_REGISTER
    )
    cy.get('#form_in_modal_dailyMintLimit').clear()
    cy.get('#form_in_modal_dailyMintLimit')
      .parents('.ant-form-item')
      .should('have.class', 'ant-form-item-has-error')
    cy.get('#form_in_modal_dailyMintLimit_help').should(
      'have.text',
      ERROR.MISSING_TOKEN_DAILY_MINT_FOR_REGISTER
    )
  })

  it('should be able to register a new token', () => {
    cy.get('#token').click()
    cy.get('#registerTokenButton').click()
    cy.get('#form_in_modal_name').type('Test')
    cy.get('#form_in_modal_symbol').type('TST')
    cy.get('#registerButton').click()
    cy.confirmMetamaskTransaction()
    cy.get('.ant-message-notice-success')
      .contains(SUCCESS.REGISTERED_TOKEN)
      .should('be.visible')
  })

  it('should not be able to register a new token with the same symbol', () => {
    cy.get('#token').click()
    cy.get('#registerTokenButton').click()
    cy.get('#form_in_modal_name').type('Test2')
    cy.get('#form_in_modal_symbol').type('TST')
    cy.get('#form_in_modal_symbol')
      .parents('.ant-form-item')
      .should('have.class', 'ant-form-item-has-error')
    cy.get('#form_in_modal_symbol_help').should(
      'have.text',
      ERROR.TOKEN_WITH_SYMBOL_ALREADY_EXIST
    )
  })

  it('should be able to register a new token with a different symbol but the same name', () => {
    cy.get('#token').click()
    cy.get('#registerTokenButton').click()
    cy.get('#form_in_modal_name').type('Test')
    cy.get('#form_in_modal_symbol').type('TST2')
    cy.get('#registerButton').click()
    cy.confirmMetamaskTransaction()
    cy.get('.ant-message-notice-success')
      .contains(SUCCESS.REGISTERED_TOKEN)
      .should('be.visible')
  })
})

describe('Multistep form step-1 with Incal', () => {
  before(() => {
    cy.visit('/')
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Incal').click()
    cy.allowMetamaskToSwitchNetwork()
    cy.get('#nextButton').click()
  })

  beforeEach(() => {
    cy.visit('/')
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Incal').click()
    cy.get('#nextButton').click()
  })

  after(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.resetMetamaskAccount()
  })

  it('should be able to register a new token', () => {
    cy.get('#token').click()
    cy.get('#registerTokenButton').click()
    cy.get('#form_in_modal_name').type('Test')
    cy.get('#form_in_modal_symbol').type('TST')
    cy.get('#registerButton').click()
    cy.confirmMetamaskTransaction()
    cy.get('.ant-message-notice-success')
      .contains(SUCCESS.REGISTERED_TOKEN)
      .should('be.visible')
  })

  describe('with TST as selected token', () => {
    beforeEach(() => {
      cy.get('#token').click()
      cy.get('#token_list')
        .parent()
        .find('.ant-select-item-option-content')
        .contains('TST')
        .click()
    })

    it('should have default balance with newly registered token', () => {
      cy.get('#token_extra')
        .should('exist')
        .and('have.text', `${DEFAULT_TOKEN_SUPPLY}.0 TST`)
    })

    it('should invalidate form if other fields are empty', () => {
      cy.get('#nextButton').click()
      cy.get('#receivingSubnet')
        .parents('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error')
      cy.get('#receivingSubnet_help').should(
        'have.text',
        ERROR.MISSING_RECEIVING_SUBNET
      )
      cy.get('#recipientAddress')
        .parents('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error')
      cy.get('#recipientAddress_help').should(
        'have.text',
        ERROR.MISSING_RECIPIENT_ADDRESS
      )
      cy.get('#amount')
        .parents('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error')
      cy.get('#amount_help').should('have.text', ERROR.MISSING_AMOUNT)
    })

    it('should invalidate form if token not registered on selected receiving subnet', () => {
      cy.get('#receivingSubnet').click()
      cy.get('#receivingSubnet_list')
        .parent()
        .find('.ant-select-item-option-content')
        .contains('Edena')
        .click()
      cy.get('#receivingSubnet')
        .parents('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error')
      cy.get('#receivingSubnet_help').should(
        'have.text',
        `TST is not registered on Edena!`
      )
    })

    it('should invalidate form if address is invalid', () => {
      cy.get('#recipientAddress').type('this is an invalid address')
      cy.get('#recipientAddress')
        .parents('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error')
      cy.get('#recipientAddress_help').should(
        'have.text',
        ERROR.INVALID_ADDRESS
      )
      cy.get('#recipientAddress').clear()
    })

    it('should not invalidate form if address is valid', () => {
      cy.get('#recipientAddress').type(
        '0x4aab25b4fad0beaac466050f3a7142a502f4cf0a'
      )
      cy.get('#recipientAddress')
        .parents('.ant-form-item')
        .should('not.have.class', 'ant-form-item-has-error')
      cy.get('#recipientAddress').clear()
      cy.get('#recipientAddress').type(
        '4aab25b4fad0beaac466050f3a7142a502f4cf0a'
      )
      cy.get('#recipientAddress')
        .parents('.ant-form-item')
        .should('not.have.class', 'ant-form-item-has-error')
      cy.get('#recipientAddress').clear()
    })

    it('should not be able to input a larger amount than current balance (default supply)', () => {
      cy.get('#amount')
        .type((DEFAULT_TOKEN_SUPPLY + 1).toString())
        .wait(500)
        .blur()
      cy.get('#amount').should('have.value', DEFAULT_TOKEN_SUPPLY)
      cy.get('#amount').clear()
      cy.wait(500)
      cy.get('#amount')
        .type((DEFAULT_TOKEN_SUPPLY - 1).toString())
        .wait(500)
        .blur()
      cy.get('#amount').should('have.value', DEFAULT_TOKEN_SUPPLY - 1)
      cy.get('#amount').clear()
    })
  })
})
