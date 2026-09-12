type PreviewRowBody = {
  lineNumber: number;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string;
  errors: string[];
};

type ConfirmRowBody = PreviewRowBody & {
  productId: string | null;
};

export type PreviewRow = PreviewRowBody & { isValid: boolean };
export type ConfirmRow = ConfirmRowBody & { isValid: boolean };

export function toPreviewRow(body: PreviewRowBody): PreviewRow {
  return { ...body, isValid: body.errors.length === 0 };
}

export function toConfirmRow(body: ConfirmRowBody): ConfirmRow {
  return { ...body, isValid: body.errors.length === 0 };
}
