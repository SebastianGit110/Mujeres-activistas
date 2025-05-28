interface MarkerType {
    active: boolean
    created_at?: Date
    id: string
    incident_type: number
    name?: string
    coords: {
        lat: number,
        lng: number
    }
    images: string[]
    create_by?: string
    where: string
    when: string
}

interface FormIncident {
    name: string
    incident_type: number
}

interface FormLogin {
    email: string
    password: string
}

interface FormRegister {
    name: string
    email: string
    password: string
}

interface IncidentType {
    id: number,
    name: string
}

interface AuthType {
    status: "authenticated" | "not-authenticated" | "checking"
    uid: string | null
    user: {
        id?: string;
        email: string | undefined
        name: string | undefined
    } | undefined
    errorMessage: string | null
}

interface Report {
    id: string;
    title: string;
    description: string;
    category: string;
    status?: string;
    created_by: string; // Este es el ID (UUID) del usuario de Supabase
    created_at: string;
    created_by_email: string;
    support_count: number;
}

// **¡Esta es tu interfaz User que SÍ tiene el 'id'!**
interface User {
    id: string; // El UUID del usuario
    email: string | undefined;
    name?: string | undefined; // Opcional: si tu usuario tiene un nombre
}

export type { MarkerType, FormIncident, IncidentType, FormLogin, FormRegister, AuthType, Report, User}