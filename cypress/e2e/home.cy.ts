describe('Home', () => {
    beforeEach(() => {
        cy.setMockUser();
        cy.visit('/home');
    });


    it('Debería mostrar el nombre de usuario en el saludo', () => {
        cy.contains('¡Hola, qué gusto verte aquí,', { timeout: 5000 }).should('exist');
        cy.get('h2 span', { timeout: 5000 }).should('contain.text', 'user123');
    });


    it('Debería habilitar los campos al hacer clic en "Editar Información"', () => {
        cy.contains('Editar Información').click();

        cy.get('input[name="nombre"]').should('not.be.disabled');
        cy.get('input[name="apellido"]').should('not.be.disabled');
        cy.get('input[name="fechaNacimiento"]').should('not.be.disabled');
        cy.get('mat-select[name="genero"]').should('not.be.disabled');
        cy.get('mat-select[name="objetivo"]').should('not.be.disabled');
    });


    it('No debería guardar si faltan campos obligatorios', () => {
        cy.contains('Editar Información').click();

        cy.get('input[name="nombre"]').scrollIntoView().clear({ force: true });
        cy.get('input[name="apellido"]').clear({ force: true });

        cy.contains('Guardar').click();

        cy.get('ion-toast', { timeout: 6000 })
            .shadow()
            .find('.toast-message')
            .should('be.visible')
            .and('contain.text', 'Completa todos los campos antes de guardar.');
    });


    it('Debería permitir editar y guardar la información del usuario', () => {
        cy.contains('Editar Información').click();

        cy.get('input[name="nombre"]').scrollIntoView().clear({ force: true }).type('Juan', { force: true });
        cy.get('input[name="apellido"]').scrollIntoView().clear({ force: true }).type('Pérez', { force: true });

        cy.get('mat-select[name="genero"]').click();
        cy.get('mat-option').contains('Masculino').click();

        cy.get('mat-select[name="objetivo"]').click();
        cy.get('mat-option').contains('Dormir mejor').click();

        const fecha = '1995-07-10';
        cy.get('input[name="fechaNacimiento"]').invoke('val', fecha).trigger('input');

        cy.contains('Guardar').click();

        cy.get('ion-toast', { timeout: 6000 })
            .shadow()
            .find('.toast-message')
            .should('be.visible')
            .and('contain.text', 'Datos guardados correctamente.');
    });


    it('Debería limpiar los campos al hacer clic en "Limpiar"', () => {
        cy.contains('Editar Información').click();

        cy.get('input[name="nombre"]').scrollIntoView().clear({ force: true }).type('Juan', { force: true });
        cy.get('input[name="apellido"]').scrollIntoView().clear({ force: true }).type('Pérez', { force: true });

        cy.contains('Limpiar').click();

        cy.get('input[name="nombre"]').should('have.value', '');
        cy.get('input[name="apellido"]').should('have.value', '');

        cy.get('ion-toast', { timeout: 10000 }).should('exist');
        cy.get('ion-toast').shadow().find('.toast-message').should('contain.text', 'Campos limpiados.');
    });


    it('Debería cancelar edición y restaurar valores anteriores', () => {
        cy.contains('Editar Información').click();

        cy.get('input[name="nombre"]').scrollIntoView().clear({ force: true }).type('Temporal', { force: true });
        cy.contains('Cancelar').click();

        cy.get('input[name="nombre"]').should('not.have.value', 'Temporal');
    });


    it('Debería navegar a la página de Daily Tracking al hacer clic en "Iniciar Seguimiento"', () => {
        cy.contains('Iniciar Seguimiento ✔️').click();
        cy.url().should('include', '/daily-tracking');
    });


    it('Debería mostrar imagen de perfil por defecto si no hay foto', () => {
        cy.get('img[alt="Foto de perfil"]')
            .should('have.attr', 'src')
            .and('include', 'assets/profile.png');
    });

});
