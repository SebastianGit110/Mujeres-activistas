import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';

export const ProfilePage = () => {
  const { email } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    birthdate: '',
    nationality: '',
    address: '',
    about: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        setProfile({
          name: user.user_metadata.name || '',
          phone: user.user_metadata.phone || '',
          birthdate: user.user_metadata.birthdate || '',
          nationality: user.user_metadata.nationality || '',
          address: user.user_metadata.address || '',
          about: user.user_metadata.about || '',
          avatar_url: user.user_metadata.avatar_url || '',
        });
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowImageOptions(false);
        setEditingAvatar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { ...profile } });

    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      alert('Perfil actualizado correctamente');
      localStorage.setItem('userName', profile.name);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Perfil del Usuario</h1>

      <div className="flex flex-col md:flex-row items-center gap-8 mb-6 relative">
        <div className="relative w-32 h-32">
          <img
            src={profile.avatar_url || 'https://placehold.co/150x150?text=Foto'}
            alt="Foto de perfil"
            className="w-32 h-32 rounded-full object-cover border"
          />
          <button
            onClick={() => setShowImageOptions(!showImageOptions)}
            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-100"
            title="Editar foto"
          >
            ✏️
          </button>

          {showImageOptions && (
            <div ref={menuRef} className="absolute top-full left-0 mt-2 bg-white shadow-md rounded p-2 w-44 text-sm z-10">
              {!editingAvatar ? (
                <>
                  <button
                    onClick={() => window.open(profile.avatar_url, '_blank')}
                    className="block w-full text-left hover:underline"
                    disabled={!profile.avatar_url}
                  >
                    Ver foto
                  </button>
                  <button
                    onClick={() => setEditingAvatar(true)}
                    className="block w-full text-left mt-1 text-purple-600 hover:underline"
                  >
                    Editar
                  </button>
                </>
              ) : (
                <>
                  <input
                    name="avatar_url"
                    value={profile.avatar_url}
                    onChange={handleChange}
                    placeholder="URL de imagen"
                    className="w-full mt-1 p-1 border border-gray-300 rounded"
                  />
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => setEditingAvatar(false)}
                      className="text-gray-500 hover:underline"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setEditingAvatar(false);
                        setShowImageOptions(false);
                      }}
                      className="text-purple-600 hover:underline"
                    >
                      Listo
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <textarea
          name="about"
          value={profile.about}
          onChange={handleChange}
          placeholder="Escribe una breve descripción sobre ti"
          className="w-full p-3 border border-gray-300 rounded resize-none"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input
            type="email"
            value={email ?? ''}
            disabled
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
          <input
            name="birthdate"
            type="date"
            value={profile.birthdate}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nacionalidad</label>
          <input
            name="nationality"
            value={profile.nationality}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            name="address"
            value={profile.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700"
      >
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
};
