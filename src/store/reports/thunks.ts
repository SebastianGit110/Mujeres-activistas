import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../utils/supabase';
import { Report } from '../../types/types';

// Crear un reporte
export const createReport = createAsyncThunk<
  Report,
  { title: string; description: string; category: string; created_by?: string; created_by_email?: string },
  { rejectValue: string }
>(
  'reports/createReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const { title, description, category, created_by, created_by_email } = reportData;

      // Construir objeto para insertar, sólo con los campos disponibles
      const newReport: any = {
        title,
        description,
        category,
        status: 'pendiente',
      };

      if (created_by) {
        newReport.created_by = created_by; // UUID si lo tienes
      } else if (created_by_email) {
        newReport.created_by_email = created_by_email; // email si no tienes UUID
      }

      const { data, error } = await supabase
        .from('reports')
        .insert([newReport])
        .select('*')
        .single();

      if (error) throw error;
      if (!data) throw new Error('El reporte creado no fue retornado.');

      return data as Report;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener todos los reportes
export const getReports = createAsyncThunk<
  Report[],
  void,
  { rejectValue: string }
>(
  'reports/getReports',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
