type AuthResponseBody = {
  accessToken: string;
  refreshToken: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
};

export function toSession(body: AuthResponseBody): Session {
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
  };
}
