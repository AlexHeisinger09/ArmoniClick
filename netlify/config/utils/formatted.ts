export const fromBodyToObject = (body: string) => { 
  const params = new URLSearchParams(body);
  const obj = Object.fromEntries(params);

  return obj;
}