import type { FormRegister } from "../../types";
import styles from "../../styles/Login.module.css"; // Reutilizamos estilos del login

interface RegisterInputsProps {
  formState: FormRegister;
  onChangeInputs: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RegisterInputs = ({
  formState,
  onChangeInputs,
}: RegisterInputsProps) => {
  return (
    <>
      <div className={`input-box ${styles.inputGroup}`}>
        <input
          type="text"
          placeholder="Nombre de Usuario"
          required
          name="name"
          onChange={onChangeInputs}
          className={styles.loginInput}
          value={formState.name}
          aria-label="Nombre de usuario"
        ></input>
      </div>

      <div className={`input-box ${styles.inputGroup}`}>
        <input
          type="text"
          placeholder="Correo electronico"
          required
          name="email"
          onChange={onChangeInputs}
          value={formState.email}
          className={styles.loginInput}
          aria-label="Correo electronico"
        ></input>
      </div>

      <div className={`input-box ${styles.inputGroup}`}>
        <input
          type="password"
          placeholder="Contraseña"
          required
          name="password"
          onChange={onChangeInputs}
          className={styles.loginInput}
          value={formState.password}
          aria-label="Correo electronico"
        ></input>
      </div>
    </>
  );
};
