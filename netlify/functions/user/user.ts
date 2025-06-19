import { Handler, HandlerEvent } from "@netlify/functions";

import { validateJWT } from "../../middlewares";
import { HEADERS } from "../../config/utils";


export const handler = async (event, context) => {
  const { httpMethod, path } = event;

  // CORS headers para todas las respuestas
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar OPTIONS request (preflight)
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Debug: mostrar todos los headers recibidos
  console.log('📋 Headers completos:', JSON.stringify(event.headers, null, 2));

  const user = await validateJWT(event.headers.authorization);
  if (user.statusCode !== 200) return user;

  if (httpMethod === "GET" && path.includes("/profile")) {
    return {
      ...user,
      headers: corsHeaders
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({
      message: "Method Not Allowed",
    }),
    headers: corsHeaders,
  };
};