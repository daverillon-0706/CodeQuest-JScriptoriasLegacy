const SAVE_TOKEN = "CODEQUEST_SAVE_V1";
/*
export function addSaveToken(payload) {
  return {
    token: SAVE_TOKEN,
    timestamp: Date.now(),
    payload
  };
}

export function verifySaveToken(data) {
  return data?.token === SAVE_TOKEN && data?.payload;
}
*/

export function addSaveToken(payload) {
  return {
    token: "CODEQUEST_SECURE_TOKEN",
    payload
  };
}

export function verifySaveToken(data) {
  return data?.token === "CODEQUEST_SECURE_TOKEN";
}
