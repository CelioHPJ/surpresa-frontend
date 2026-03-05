/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Garantindo um tom de vermelho bem elegante e romântico para a Rafaela (e passando bem longe do roxo!)
        amor: '#b91c1c', 
        amorEscuro: '#7f1d1d'
      }
    },
  },
  plugins: [],
}