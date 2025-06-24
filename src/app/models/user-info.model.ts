export interface UserInfo {
    id?: number; // generado automáticamente por json-server*
    userId: number;
    genero: string;
    objetivo: string;
    fechaNacimiento: string | Date;
    recibirNotificaciones: boolean;
}
