// src/green-alert/pages/EnvironmentalReports.tsx

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from "../../hooks/useStore";
import { getReports, createReport } from '../../store/reports/thunks';
// Asegúrate de que esta ruta sea correcta: de 'supportVotesThunks'
import { addSupportVote } from '../../store/reports/supportVotes';
import { clearMessages } from '../../store/reports/supportVotesSlice';
import { AuthType, Report } from '../../types/types';
import Swal from 'sweetalert2';
// Importa los iconos de corazón de React Icons
import { FaRegHeart, FaHeart } from 'react-icons/fa'; // Corazón vacío y corazón relleno

// ¡IMPORTANTE: Importa el cliente de Supabase aquí!
import { supabase } from '../../utils/supabase'; // <--- ¡AÑADIDO AQUÍ!

export default function EnvironmentalReports() {
  const dispatch = useAppDispatch();

  const { reports, loading, error } = useAppSelector(state => state.reports) as { reports: Report[]; loading: boolean; error: string | null };

  const authState = useAppSelector(state => state.auth) as AuthType;
  const currentUser = authState.user;
  const authStatus = authState.status;

  const { loading: votingLoading, error: votingError, successMessage } = useAppSelector(state => state.supportVotes);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');

  // Nuevo estado para almacenar los IDs de los reportes que el usuario ya ha votado
  // Especificamos que es un Set de strings
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  // --- Efecto para cargar reportes y el estado de votos del usuario ---
  useEffect(() => {
    // Carga inicial de reportes
    if (reports.length === 0 && !loading && !error) {
      dispatch(getReports());
    }

    // Si el usuario está autenticado, intentar cargar sus votos
    if (authStatus === 'authenticated' && currentUser?.email) {
      // Función asíncrona interna para obtener los votos del usuario
      const fetchUserVotes = async () => {
        try {
          // Tipamos el data que viene de Supabase para que TypeScript lo entienda
          const { data, error: fetchError } = await supabase
            .from('support_votes')
            .select('reporte_id')
            .eq('user_email_vote', currentUser.email);

          if (fetchError) { // Cambiado a fetchError para no confundir con el error global
            console.error("Error al cargar votos del usuario:", fetchError);
            return;
          }

          if (data) {
            // Aseguramos que `vote` sea tipado correctamente como `{ reporte_id: string }`
            const votedReportIds = new Set(data.map((vote: { reporte_id: string }) => vote.reporte_id));
            setUserVotes(votedReportIds);
          }
        } catch (e) {
          console.error("Error inesperado al obtener votos del usuario:", e);
        }
      };

      fetchUserVotes();
    } else {
      // Si no hay usuario autenticado, limpiar los votos del estado
      setUserVotes(new Set());
    }
  }, [dispatch, reports.length, loading, error, authStatus, currentUser]);


  useEffect(() => {
    if (votingError) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: votingError,
        confirmButtonColor: '#EF4444',
      });
      dispatch(clearMessages());
    }
    if (successMessage) {
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: successMessage,
        confirmButtonColor: '#22C55E',
      }).then(() => {
          // Recargar los reportes Y los votos del usuario para reflejar el cambio
          dispatch(getReports());
          // Vuelve a cargar los votos del usuario para actualizar el icono del corazón
          // Esto es importante para que el corazón cambie de estado inmediatamente.
          if (authStatus === 'authenticated' && currentUser?.email) {
            supabase
              .from('support_votes')
              .select('reporte_id')
              .eq('user_email_vote', currentUser.email)
              .then(({ data, error: reloadError }) => { // Tipamos data y error
                if (reloadError) {
                  console.error("Error recargando votos para icono:", reloadError);
                }
                // Aseguramos que `vote` sea tipado correctamente como `{ reporte_id: string }`
                if (data) setUserVotes(new Set(data.map((vote: { reporte_id: string }) => vote.reporte_id)));
              });
          }
      });
      dispatch(clearMessages());
    }
  }, [votingError, successMessage, dispatch, authStatus, currentUser]); // Añadimos dependencias

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !category.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos para el reporte.',
        confirmButtonColor: '#3B82F6',
      });
      return;
    }

    if (!currentUser || authStatus !== 'authenticated' || typeof currentUser.email === 'undefined' || currentUser.email === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso denegado',
        text: 'Debes iniciar sesión para publicar un reporte. Si ya estás logueado, por favor recarga la página o verifica tu conexión.',
        confirmButtonColor: '#22C55E',
      });
      return;
    }

    try {
      console.log("Intentando crear reporte con email:", currentUser.email);
      await dispatch(createReport({
        title: title.trim(),
        description: description.trim(),
        category,
        created_by_email: currentUser.email,
      })).unwrap();

      setTitle('');
      setDescription('');
      setCategory('general');

      Swal.fire({
        icon: 'success',
        title: '¡Reporte publicado!',
        text: 'Tu reporte ambiental ha sido creado con éxito.',
        confirmButtonColor: '#22C55E',
      });

      dispatch(getReports()); // Recarga los reportes después de crear uno
    } catch (err: any) {
      console.error("Error al publicar reporte:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error al publicar',
        text: `No se pudo crear el reporte: ${err.message || 'Error desconocido'}`,
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleVote = (reportId: string) => {
    console.log("--- Depuración de Voto ---");
    console.log("authStatus antes de votar:", authStatus);
    console.log("currentUser antes de votar (objeto completo):", currentUser);

    if (votingLoading) {
      console.log("Voto en curso, evitando múltiples clics.");
      return;
    }

    if (!currentUser) {
      console.log("Voto denegado: currentUser es nulo.");
      Swal.fire({
        icon: 'warning',
        title: 'Debes iniciar sesión',
        text: 'Para apoyar un reporte debes estar autenticado.',
        confirmButtonColor: '#22C55E',
      });
      return;
    }

    if (authStatus !== 'authenticated') {
      console.log("Voto denegado: authStatus no es 'authenticated'.");
      Swal.fire({
        icon: 'warning',
        title: 'Estado de autenticación',
        text: 'Tu sesión no está activa. Por favor, inicia sesión de nuevo.',
        confirmButtonColor: '#22C55E',
      });
      return;
    }

    if (typeof currentUser.email !== 'string' || !currentUser.email) {
      console.error("Voto denegado: currentUser.email no es un string válido.", {
        email: currentUser.email,
        typeOfEmail: typeof currentUser.email
      });
      Swal.fire({
        icon: 'error',
        title: 'Información de usuario incompleta',
        text: 'No se pudo obtener tu Email de usuario. Por favor, intenta recargar la página o volver a iniciar sesión.',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    console.log("Email de usuario para votar:", currentUser.email);
    dispatch(addSupportVote({ user_email: currentUser.email, reporte_id: reportId }));
    console.log("-----------------------------------------------");
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'Ambiental': return 'bg-green-100 text-green-800';
      case 'Seguridad': return 'bg-red-100 text-red-800';
      case 'Maltrato': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center leading-tight">
        Reportes Ambientales <span className="text-purple-500">Comunitarios</span>
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-5 border-b pb-3">Crea un Nuevo Reporte</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Título breve y claro del reporte"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            required
          />
          <textarea
            placeholder="Describe detalladamente el acontecimiento ambiental..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 h-32 resize-y focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            required
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 appearance-none focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          >
            <option value="general">Categoría General</option>
            <option value="Ambiental">Impacto Ambiental</option>
            <option value="Seguridad">Riesgo de Seguridad</option>
            <option value="Maltrato">Maltrato Animal</option>
          </select>
          <button
            type="submit"
            className="bg-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1  0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Publicar Nuevo Reporte
            </span>
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-semibold text-gray-700 mb-5 border-b pb-3">Últimos Reportes</h2>

      {loading && <p className="text-center text-lg text-gray-600">Cargando reportes...</p>}
      {error && <p className="text-center text-lg text-red-600">Error al cargar: {error}</p>}

      {!loading && reports.length === 0 && (
        <p className="text-center text-gray-500">No hay reportes para mostrar.</p>
      )}

      <ul className="space-y-6">
        {reports.map((report) => (
          <li
            key={report.id}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${getCategoryClass(report.category)}`}>
              {report.category}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{report.title}</h3>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{report.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>Publicado por: {report.created_by_email}</span>
              <span>Fecha: {new Date(report.created_at).toLocaleDateString()}</span>
            </div>
            <button
              onClick={() => handleVote(report.id)}
              disabled={votingLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                ${votingLoading ? 'bg-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {votingLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  />
                </svg>
              ) : (
                // Lógica condicional para mostrar el corazón relleno o vacío
                userVotes.has(report.id) ? (
                  <FaHeart className="text-purple-600 h-5 w-5 transition-transform transform hover:scale-110" />
                ) : (
                  <FaRegHeart className="text-gray-400 h-5 w-5 transition-transform transform hover:scale-110" />
                )
              )}
              {/* Sólo el número de votos */}
              <span className="ml-1">{report.support_count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}