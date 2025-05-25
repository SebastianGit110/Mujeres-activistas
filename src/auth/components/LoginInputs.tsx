import type { FormLogin } from "../../types";
import styles from "../../styles/Login.module.css";

interface LoginInputsProps {
  formState: FormLogin;
  onChangeInputs: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginInputs = ({ formState, onChangeInputs }: LoginInputsProps) => {
  return (
    <>
      <div className={styles.inputGroup}>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          required
          value={formState.email}
          onChange={onChangeInputs}
          className={styles.loginInput}
          aria-label="Correo electrónico"
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          value={formState.password}
          onChange={onChangeInputs}
          className={styles.loginInput}
          aria-label="Contraseña"
        />
      </div>
    </>
  );
};
