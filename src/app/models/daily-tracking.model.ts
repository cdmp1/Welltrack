export interface DailyTracking {
    id?: number;  
    userId: number;
    fecha: string;  
    sueno: string;
    horasSueno: number;
    animo: string;
    ejercicio: boolean;
    notas: string;
    sincronizado?: boolean;
}