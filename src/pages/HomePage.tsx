import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

import { Container } from "../components";

export const HomePage = () => {
  // Hago uso del hook, useNavigate para poder navegar entre las rutas de mi
  // aplicacion, que defini en mi <AppRouter />
  const navigate = useNavigate();

  const navigateToMap = () => {
    // En este caso creo una funcion, que se va a encargar de usar la funcion
    // de router dom, para navegar hacia /mapa
    navigate("/map");
  };

  // El resto son los estilos y estructura que va a tener esta pagina
  return (
    <Container>
      <section className="pt-12">
        <article className="text-center flex flex-col items-center h-auto p-20">
          <h1 className="text-white font-extrabold text-[90px] drop-shadow-[4px_4px_0_black]">
            MujeresPorElCambio
          </h1>

          <h3 className="w-[970px] text-center text-black bg-white/30 backdrop-blur-md rounded-xl p-10 shadow-lg">
            Accede a nuestra plataforma dedicada a visibilizar el trabajo de mujeres activistas en todo el territorio.
            Desde nuestro sitio, podrás explorar de manera clara y significativa los perfiles, historias y contribuciones
            de mujeres que lideran procesos sociales, ambientales, culturales y políticos. Nuestra herramienta te permite
            navegar por un mapa interactivo, descubrir oportunidades de mentoría y conectarte con iniciativas en tu región.
            Con un compromiso firme con la equidad, la memoria y la participación, te invitamos a conocer, apoyar y difundir
            las voces de las mujeres que transforman realidades.
          </h3>
        </article>
      </section>

    </Container>
  );
};
