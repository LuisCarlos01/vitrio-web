type UserResponseBody = {
  id: string;
  email: string;
  name: string | null;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
};

export function toUser(body: UserResponseBody): User {
  return {
    id: body.id,
    email: body.email,
    name: body.name,
  };
}
