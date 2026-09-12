type CategoryResponseBody = {
  id: string;
  catalogId: string;
  name: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
};

export function toCategory(body: CategoryResponseBody): Category {
  return {
    id: body.id,
    name: body.name,
  };
}
