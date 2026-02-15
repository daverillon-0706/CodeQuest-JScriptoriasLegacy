const SAVE_TOKEN = "CODEQUEST_SECURE_TOKEN";

export function addSaveToken(payload) {
  return {
    token: SAVE_TOKEN,
    payload
  };
}

export function verifySaveToken(data) {
  return data?.token === SAVE_TOKEN && typeof data.payload === "object";
}
