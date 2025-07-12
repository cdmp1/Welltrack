describe('Seguimiento Diario', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('userId', '4');
        });

        cy.visit('/daily-tracking');
        cy.get('app-daily-tracking', { timeout: 10000 }).should('be.visible');
    });


    it('Debería mostrar campos vacíos si no hay registro para el día', () => {
        cy.wait(1000);
        cy.get('ion-select').eq(0).should('have.prop', 'value', '');
        cy.get('ion-select').eq(1).should('have.prop', 'value', '');
        cy.get('ion-toggle').shadow().find('input[type="checkbox"]').should('not.be.checked');
        cy.get('ion-textarea textarea').should('have.value', '');
    });


    it('No debería permitir guardar sin completar campos mínimos', () => {
        cy.get('ion-button').contains('Guardar Seguimiento')
            .should('have.class', 'button-disabled');
    });


    it('Debería permitir guardar un seguimiento válido', () => {
        const fakeUser = {
            id: 4,
            username: 'user123',
            nombre: 'Juan',
            apellido: 'Pérez',
            estado: 'activo',
            rol: 'usuario'
        };

        cy.visit('/daily-tracking', {
            onBeforeLoad(win) {
                win.localStorage.setItem('userId', fakeUser.id.toString());
                win.localStorage.setItem('user', JSON.stringify(fakeUser));
                (win as any).Cypress = true;
                (win as any).CypressUser = fakeUser;
            }
        });

        cy.get('app-daily-tracking', { timeout: 10000 }).should('be.visible');

        cy.intercept('PUT', '/dailyTracking/*').as('putTracking');

        cy.get('ion-select').eq(0).click({ force: true });
        cy.get('ion-select-popover ion-item').contains('Feliz').click({ force: true });

        cy.get('ion-select').eq(1).click({ force: true });
        cy.get('ion-select-popover ion-item').contains('Bien').click({ force: true });

        cy.get('ion-select').eq(2).click({ force: true });
        cy.get('ion-select-popover ion-item').contains('9').click({ force: true });

        cy.get('ion-toggle').shadow().find('input[type="checkbox"]').click({ force: true });

        cy.get('ion-textarea textarea').type('Falta poco para las vacaciones!', { force: true });

        cy.get('ion-button').contains('Guardar Seguimiento')
            .should('not.have.class', 'button-disabled')
            .click({ force: true });

        cy.wait('@putTracking').its('response.statusCode').should('eq', 200);
    });


});
