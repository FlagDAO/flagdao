// require("dotenv").config();
// import 'dotenv/config'  Vite don't need this.

export const email = import.meta.env.VITE_EMAIL || "";
export const password = import.meta.env.VITE_PASSWORD || "";

export const supabaseUrl = import.meta.env.VITE_SU || "";
export const supabaseKey = import.meta.env.VITE_SK || "";