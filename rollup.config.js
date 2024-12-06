import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'main.js', // Fichier d'entrée principal
  output: {
    file: 'dist/bundle.js', // Fichier de sortie
    format: 'iife', // Format compatible avec les navigateurs (immediately-invoked function expression)
    sourcemap: false,
  },
  plugins: [
    resolve(), // Permet de résoudre les modules depuis node_modules
    terser(),  // Minifie le code pour un fichier de sortie plus petit
  ],
};