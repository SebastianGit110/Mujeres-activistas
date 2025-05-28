// src/store/reports/supportVotesThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../utils/supabase'; // Asegúrate de que la ruta a tu cliente Supabase sea correcta

// Definimos la interfaz para el payload del thunk.
interface AddSupportVotePayload {
  user_email: string; // El email del usuario que está votando
  reporte_id: string; // El ID del reporte al que se le está dando soporte
}

export const addSupportVote = createAsyncThunk<
  // El tipo de retorno ahora es un string para indicar si se añadió o eliminó el voto,
  // lo cual usaremos en el slice para el mensaje de éxito.
  'added' | 'removed',
  AddSupportVotePayload,
  { rejectValue: string }
>(
  'supportVotes/addSupportVote',
  // La función asíncrona que contiene la lógica del thunk
  async ({ user_email, reporte_id }, { rejectWithValue }) => {
    try {
      // 1. Verificar si el usuario (por email) ya ha votado por este reporte.
      // Usamos 'user_email_vote' como el nombre de la columna en tu tabla de Supabase.
      const { data: existingVote, error: checkError } = await supabase
        .from('support_votes') // Nombre de tu tabla de votos en Supabase
        .select('*')
        .eq('reporte_id', reporte_id) // Filtra por el ID del reporte
        .eq('user_email_vote', user_email) // Filtra por el email del usuario
        .limit(1); // Añadimos limit(1) para mayor eficiencia, solo necesitamos saber si existe uno

      // PGRST116 es el código de error de Supabase para "No rows found".
      // Si hay un error y NO es PGRST116, entonces es un error real de la base de datos.
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error al verificar voto existente (Supabase):", checkError);
        throw checkError; // Lanza el error para que sea capturado por el catch
      }

      // Si se encontró un voto existente, significa que el usuario ya apoyó este reporte.
      // En este caso, lo eliminamos y decrementamos el contador.
      if (existingVote && existingVote.length > 0) {
        console.log(`Voto existente para ${user_email} en reporte ${reporte_id}. Procediendo a eliminar.`);

        // Eliminar el voto de la tabla support_votes
        const { error: deleteError } = await supabase
          .from('support_votes')
          .delete()
          .eq('reporte_id', reporte_id)
          .eq('user_email_vote', user_email); // Asegúrate de eliminar el voto específico

        if (deleteError) {
          console.error('Error al eliminar voto (Supabase):', deleteError);
          throw deleteError;
        }

        // Llamar a la función RPC para DECREMENTAR el contador de votos
        const { error: decrementError } = await supabase
          .rpc('decrement_report_votes', { report_id_param: reporte_id });

        if (decrementError) {
          console.error('Error al llamar a RPC decrement_report_votes:', decrementError);
          throw decrementError;
        }

        console.log(`Voto eliminado y contador decrementado para reporte ${reporte_id} por ${user_email}.`);
        return 'removed'; // Indica que el voto fue eliminado
      }

      // Si NO existe un voto, lo insertamos y lo incrementamos.
      console.log(`No se encontró voto existente. Procediendo a insertar para ${user_email} en reporte ${reporte_id}.`);

      const { error: insertError } = await supabase
        .from('support_votes') // Nombre de tu tabla de votos
        .insert({
          reporte_id: reporte_id,
          user_email_vote: user_email, // Inserta el email del usuario en la columna correspondiente
          // Supabase suele manejar 'created_at' automáticamente si la columna está configurada
        });

      // Si hay un error durante la inserción, lánzalo.
      if (insertError) {
        console.error("Error al insertar nuevo voto (Supabase):", insertError);
        throw insertError;
      }

      // Llamar a la función RPC para INCREMENTAR el contador de votos
      const { error: incrementError } = await supabase
        .rpc('increment_report_votes', { report_id_param: reporte_id });

      // Si hay un error al actualizar el contador, lánzalo.
      if (incrementError) {
        console.error('Error al llamar a RPC increment_report_votes:', incrementError);
        throw incrementError;
      }

      console.log(`Voto registrado e contador incrementado para el reporte ${reporte_id} por ${user_email}.`);
      return 'added'; // Indica que el voto fue añadido
    } catch (error: any) {
      // Captura cualquier error que haya ocurrido en los pasos anteriores.
      console.error("Error general en addSupportVote thunk catch:", error);
      // Devuelve el mensaje de error para que el slice lo maneje y lo muestre en el frontend.
      return rejectWithValue(error.message || 'Error desconocido al procesar el apoyo.');
    }
  }
);