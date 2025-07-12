describe('Login', () => {
    beforeEach(() => {
        cy.visit('/login');
    });


    it('Debería iniciar sesión con credenciales válidas', () => {
        cy.intercept('GET', '**/users?username=user123').as('loginRequest');

        cy.get('ion-input[name="username"] input').type('user123');
        cy.get('ion-input[name="password"] input').type('1234');

        cy.get('ion-button[type="submit"]').should('not.be.disabled').click();

        cy.wait('@loginRequest');

        cy.url().should('include', '/home');
    });


    it('Debería mostrar error con credenciales incorrectas', () => {
        cy.intercept('GET', '**/users?username=invalid1').as('loginFail');

        cy.get('ion-input[name="username"] input').type('invalid1');
        cy.get('ion-input[name="password"] input').type('0000');

        cy.get('ion-button[type="submit"]').should('not.be.disabled').click();

        cy.wait('@loginFail');

        cy.get('ion-toast').should('exist');

        cy.get('ion-toast').shadow().find('.toast-message').should('contain.text', 'Credenciales incorrectas');
    });


    it('Debería impedir login con campos vacíos', () => {
        cy.get('ion-button[type="submit"]').should('have.attr', 'disabled');
    });


    it('Debería impedir login con formato inválido', () => {
        cy.get('ion-input[name="username"] input').type('usuario_con_espacios').blur();
        cy.get('ion-input[name="password"] input').type('abc').blur();

        cy.get('ion-button[type="submit"]').should('have.attr', 'disabled');
    });


});
