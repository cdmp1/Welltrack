/// <reference types="cypress" />


Cypress.Commands.add('setMockUser', () => {
    const mockUser = {
        userId: 4,
        id: "4",
        username: 'user123',
        nombre: 'Juan',
        apellido: 'Pérez',
        genero: 'masculino',
        fechaNacimiento: '1995-07-10',
        objetivo: 'ControlHabitos',
        recibirNotificaciones: true,
        estado: 'activo',
        rol: 'user'
    };

    cy.window().then((win) => {
        win.localStorage.setItem('userId', '4'); 
        win.localStorage.setItem('user', JSON.stringify(mockUser)); 
    });
});
