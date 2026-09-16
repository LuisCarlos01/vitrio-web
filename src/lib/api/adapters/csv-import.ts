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

// Conjunto fechado de mensagens que o vitrio-api pode devolver pra cada linha
// (CsvImportService/ImageDownloadException/etc., sempre em inglês); qualquer
// mensagem fora desse conjunto cai no fallback (texto original).
const CSV_IMPORT_ERROR_TRANSLATIONS: Record<string, string> = {
  'name is required': 'Nome é obrigatório',
  'image is required': 'Imagem é obrigatória',
  'image must be a valid http(s) URL': 'Imagem deve ser uma URL http(s) válida',
  'code is already in use in this catalog':
    'Código já está em uso neste catálogo',
  'catalog has reached the maximum of 50 products':
    'Catálogo atingiu o limite de 50 produtos',
  'could not download image from URL':
    'Não foi possível baixar a imagem da URL informada',
  'File exceeds the maximum allowed size of 10MB':
    'Arquivo excede o tamanho máximo permitido de 10MB',
  'Unsupported image format': 'Formato de imagem não suportado',
  'SKU already in use in this catalog':
    'Código (SKU) já está em uso neste catálogo',
  'Catalog has reached the maximum of 50 products':
    'Catálogo atingiu o limite de 50 produtos',
};

export function translateCsvImportError(message: string): string {
  return CSV_IMPORT_ERROR_TRANSLATIONS[message] ?? message;
}

export function toPreviewRow(body: PreviewRowBody): PreviewRow {
  return {
    ...body,
    errors: body.errors.map(translateCsvImportError),
    isValid: body.errors.length === 0,
  };
}

export function toConfirmRow(body: ConfirmRowBody): ConfirmRow {
  return {
    ...body,
    errors: body.errors.map(translateCsvImportError),
    isValid: body.errors.length === 0,
  };
}
