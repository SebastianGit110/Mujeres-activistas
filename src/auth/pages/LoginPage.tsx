import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import 'animate.css';

import { Container } from "../../components";
import { useAppDispatch, useFormValues } from "../../hooks";
import { onLoginUser } from "../../store/auth";
import { FormLogin } from "../../types";
import { LoginInputs } from "../components";

import styles from "../../styles/Login.module.css";

const initialStateForm: FormLogin = {
  email: "",
  password: ""
};

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { formState, onChangeInputs } = useFormValues({ initialStateForm });

  const [formAnimationClass, setFormAnimationClass] = useState("animate__animated animate__jackInTheBox");
  const formRef = useRef<HTMLFormElement>(null);

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formRef.current) {
      setFormAnimationClass("animate__animated animate__fadeOutUp");
    }

    setTimeout(() => {
      dispatch(onLoginUser(formState));
    }, 300);
  };

  return (
     <Container className="flex items-center justify-center">
    <div className={styles.loginContainer}>
      <h2 className={`${styles.loginTitle} animate__animated animate__fadeInDown text-[#37785e]`}>
        MujeresPorElCambio
      </h2>
      <p className={`${styles.loginSubtitle} animate__animated animate__fadeIn text-[#37785e]`}>
        Seguridad ambiental en tiempo real
      </p>

      <form
        ref={formRef}
        onSubmit={handleOnSubmit}
        className={`${styles.loginForm} ${formAnimationClass}`}
      >
        <LoginInputs
          formState={formState}
          onChangeInputs={onChangeInputs}
        />

        <button type="submit" className={`${styles.loginButton} bg-[#37785e]`}>
          Iniciar sesión
        </button>

        <p className={`${styles.loginSubtitle} animate__animated animate__fadeInUp`}>
          ¿No tienes una cuenta?{" "}
          <Link to="/auth/register">Regístrate</Link><br />
          <Link to="/">Ir al inicio</Link>
        </p>
      </form>
    </div>
    </Container>
  );
};
