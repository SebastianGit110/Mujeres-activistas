import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'animate.css';

import { useAppDispatch, useFormValues } from "../../hooks";
import { onRegisterUser } from "../../store/auth";

import { Container } from "../../components";
import { RegisterInputs } from "../components";

import type { FormRegister } from "../../types";
import styles from "../../styles/Login.module.css"; // Reutilizamos estilos del login

const initialStateForm: FormRegister = {
  name: "",
  email: "",
  password: "",
};

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const { formState, onChangeInputs } = useFormValues({ initialStateForm });

  const [formAnimationClass, setFormAnimationClass] = useState("animate__animated animate__slideInUp");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (formRef.current) {
      setFormAnimationClass("animate__animated animate__fadeOutUp");
    }

    try {
      // Aquí asumes que `onRegisterUser` maneja errores internamente o los lanza
      await dispatch(onRegisterUser(formState));

      setSuccessMsg("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
      setTimeout(() => navigate("/auth/login"), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || "Error al registrar usuario");
      setFormAnimationClass("animate__animated animate__shakeX");
    }
  };

  return (
    <Container className="flex items-center justify-center">
      <div className={styles.loginContainer}>
        <h2 className={`${styles.loginTitle} animate__animated animate__fadeInDown text-[#37785e]`}>
          Crea tu cuenta en MujeresPorElCambio
        </h2>
        <p className={`${styles.loginSubtitle} animate__animated animate__fadeIn text-[#37785e]`}>
          Seguridad ambiental en tiempo real
        </p>

        <form
          ref={formRef}
          onSubmit={handleOnSubmit}
          className={`${styles.loginForm} ${formAnimationClass}`}
        >
          <RegisterInputs
            formState={formState}
            onChangeInputs={onChangeInputs}
          />

          <button type="submit" className={`${styles.loginButton} bg-[#37785e]`}>
            Registrarme
          </button>
        <p className={`${styles.loginSubtitle} animate__animated animate__fadeInUp`}>
          ¿Ya tienes una cuenta?{" "}
          <Link to="/auth/login">Inicia sesión aquí</Link>
          <br />
          <Link to="/">Ir al inicio</Link>
        </p>
        </form>


        {errorMsg && (
          <p
            className={`${styles.errorMsg} animate__animated animate__shakeX`}
            style={{ color: "red", marginTop: "1rem" }}
          >
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p
            className={`${styles.successMsg} animate__animated animate__fadeIn`}
            style={{ color: "green", marginTop: "1rem" }}
          >
            {successMsg}
          </p>
        )}
      </div>
    </Container>
  );
};
