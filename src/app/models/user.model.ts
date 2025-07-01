export interface User {
    id?: number;
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    rol?: 'admin' | 'user';  
    estado: 'activo' | 'bloqueado'; 
}
