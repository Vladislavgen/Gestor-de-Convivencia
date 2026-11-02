import Logo from "./Logo";
import "./AuthLayout.css";

// Pantalla partida para login y registro: a la izquierda la presentación,
// a la derecha el formulario que recibe como children.
function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="auth">
      <aside className="auth-panel">
        <div className="auth-panel-marca">
          <Logo tamano={34} />
          <span>Gestor de Convivencia</span>
        </div>

        <h2>Las cuentas de la casa, claras para todos.</h2>

        <ul className="auth-panel-lista">
          <li>Cargá un gasto en segundos, o escribilo como una frase y la IA lo completa.</li>
          <li>Mirá quién le debe a quién, sin planillas ni discusiones.</li>
          <li>Repartí las tareas de la casa y que nadie se olvide de la suya.</li>
        </ul>

        <div className="auth-ejemplo" aria-hidden="true">
          <span className="auth-ejemplo-titulo">Cómo saldar las cuentas</span>
          <span>
            <strong>Caro</strong> le pasa <strong>$ 7.000</strong> a <strong>Ana</strong>
          </span>
          <span>
            <strong>Bruno</strong> le pasa <strong>$ 1.000</strong> a <strong>Ana</strong>
          </span>
        </div>
      </aside>

      <div className="card auth-card">
        <h1>{titulo}</h1>
        <p className="auth-subtitulo">{subtitulo}</p>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
