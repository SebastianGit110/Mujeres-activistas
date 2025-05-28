import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addSupportVote } from './supportVotes'; // Asegúrate de que la ruta es correcta

interface SupportVotesState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: SupportVotesState = {
  loading: false,
  error: null,
  successMessage: null,
};

const supportVotesSlice = createSlice({
  name: 'supportVotes',
  initialState,
  reducers: {
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addSupportVote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      // El payload ahora puede ser 'added' o 'removed'
      .addCase(addSupportVote.fulfilled, (state, action: PayloadAction<'added' | 'removed'>) => {
        state.loading = false;
        if (action.payload === 'added') {
          state.successMessage = '¡Gracias por apoyar el reporte!';
        } else if (action.payload === 'removed') {
          state.successMessage = 'Apoyo retirado.';
        } else {
          state.successMessage = 'Operación de apoyo completada.';
        }
      })
      .addCase(addSupportVote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al procesar el apoyo';
      });
  },
});

export const { clearMessages } = supportVotesSlice.actions;
export default supportVotesSlice.reducer;