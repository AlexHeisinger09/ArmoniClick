import { envs } from '../envs';

const CORS = {
  "Access-Control-Allow-Origin": envs.FRONTEND_URL,
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

export const HEADERS = {
  json: {
    ...CORS,
    "Content-Type": "application/json",
  },
};