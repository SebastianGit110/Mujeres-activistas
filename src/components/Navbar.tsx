import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Button } from "@nextui-org/react";
import { onLogoutUser } from "../store/auth";
import { useEffect } from "react";
import { animate } from "animejs";

export const Navbar = () => {
  const { status } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleOnClick = () => {
    dispatch(onLogoutUser());
    navigate("/");
  };

  const text = "MujeresPorElCambio";

  useEffect(() => {
    animate('h1 span', {
      y: [
        { to: '-1rem', ease: 'outExpo', duration: 600 },
        { to: 0, ease: 'outBounce', duration: 800, delay: 100 }
      ],
      rotate: {
        from: '-1turn',
        delay: 0
      },
      delay: (_, i) => i * 50,
      ease: 'inOutCirc',
      loopDelay: 1000,
      loop: true
    });
  }, []);


  return (
    <div className="bg-white flex p-6 px-16 items-center">
      <header className="flex-1">
        <Link to="/">
          <h1 className="font-bold text-[30px] inline-block pr-6">
            {text.split("").map((char, index) => (
              <span key={index} className="inline-block">
                {char}
              </span>
            ))}
          </h1>
        </Link>
      </header>

      <section className="text-xl">
        <nav>
          <ul className="flex gap-6 items-center">
            <li>
              <Link to="/map">Mapa</Link>
            </li>

            <li>
              <Link to="/graphics">Estadísticas</Link>
            </li>

            {status === "authenticated" ? (
              <li>
                <Button onClick={handleOnClick} color="danger">
                  Cerrar sesion
                </Button>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/auth/login">Inicia sesion</Link>
                </li>
                <li>
                  <Link to="/auth/register">Registrate</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </section>
    </div>
  );
};
