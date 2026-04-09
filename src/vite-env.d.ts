/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYSIS_MODE?: 'cv' | 'gemini';
  readonly VITE_CV_SERVER_URL?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
