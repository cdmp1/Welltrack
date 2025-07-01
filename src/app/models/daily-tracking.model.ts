export interface DailyTracking {
    id?: number;  
    userId: number;
    fecha: string; // 'YYYY-MM-DD'
    sueno: string;
    horasSueno: number;
    animo: string;
    ejercicio: boolean;
    notas: string;
    sincronizado?: boolean;
}