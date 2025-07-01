export interface UserInfo {
    id?: number;
    userId: number;
    genero: string;
    objetivo: string;
    fechaNacimiento: string | Date;
    recibirNotificaciones: boolean;
}
