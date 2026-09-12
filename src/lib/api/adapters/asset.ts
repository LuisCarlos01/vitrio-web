type AssetResponseBody = {
  id: string;
  catalogId: string;
  contentType: string;
  byteSize: number;
  publicUrl: string;
  createdAt: string;
};

export type Asset = {
  id: string;
  publicUrl: string;
};

export function toAsset(body: AssetResponseBody): Asset {
  return {
    id: body.id,
    publicUrl: body.publicUrl,
  };
}
