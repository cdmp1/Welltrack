/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        setMockUser(): Chainable<void>;
    }
}
