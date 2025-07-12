describe('Registro', () => {
    beforeEach(() => {
        cy.visit('/register');
    });


    it('Debería registrar un nuevo usuario válido', () => {
        // Intercepta la petición POST a json-server
        cy.intercept('POST', '**/users').as('postUser');

        cy.get('input[formControlName="username"]').type('user123');
        cy.get('input[formControlName="nombre"]').type('Juan');
        cy.get('input[formControlName="apellido"]').type('Pérez');
        cy.get('input[formControlName="email"]').type('jp@example.com');
        cy.get('input[formControlName="password"]').type('1234');

        cy.get('ion-button[type="submit"]').should('not.be.disabled').click();

        // Espera a que se complete la solicitud POST
        cy.wait('@postUser');

        // Verifica redirección a /home
        cy.url().should('include', '/home');
    });


    it('Debería mostrar errores si los campos están vacíos', () => {
        // Activar validaciones tocando y saliendo de cada campo
        cy.get('input[formControlName="username"]').focus().blur();
        cy.get('input[formControlName="nombre"]').focus().blur();
        cy.get('input[formControlName="apellido"]').focus().blur();
        cy.get('input[formControlName="email"]').focus().blur();
        cy.get('input[formControlName="password"]').focus().blur();

        // Verificar que el botón esté deshabilitado
        cy.get('ion-button[type="submit"]').should('have.class', 'button-disabled');

        // Verificar los mensajes de error
        cy.contains('El usuario es obligatorio').should('exist');
        cy.contains('El nombre es obligatorio').should('exist');
        cy.contains('El apellido es obligatorio').should('exist');
        cy.contains('El email es obligatorio').should('exist');
        cy.contains('La contraseña es obligatoria').should('exist');
    });

    
    it('No debería permitir un nombre de usuario con caracteres inválidos', () => {
        cy.get('input[formControlName="username"]').type('invalid!');
        cy.get('input[formControlName="username"]').blur();
        cy.contains('Solo se permiten letras y números (sin espacios)').should('exist');
    });
    
});
