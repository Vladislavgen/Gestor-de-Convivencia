// Ícono de la casa que se usa en la barra de navegación y en el login
function Logo({ tamano = 28 }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="logo"
    >
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path
        d="M7 15.5 16 8l9 7.5M9.5 14.5V24h13v-9.5M14 24v-5h4v5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Logo;
