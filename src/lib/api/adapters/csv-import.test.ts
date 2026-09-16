import { describe, expect, it } from 'vitest';
import {
  toConfirmRow,
  toPreviewRow,
  translateCsvImportError,
} from './csv-import';

describe('translateCsvImportError', () => {
  it('translates a known API error message to pt-BR', () => {
    expect(translateCsvImportError('name is required')).toBe(
      'Nome é obrigatório',
    );
    expect(translateCsvImportError('could not download image from URL')).toBe(
      'Não foi possível baixar a imagem da URL informada',
    );
  });

  it('falls back to the original text for an unmapped message', () => {
    expect(translateCsvImportError('some new error from the API')).toBe(
      'some new error from the API',
    );
  });
});

describe('toPreviewRow', () => {
  it('maps a valid row (no errors)', () => {
    const raw = {
      lineNumber: 2,
      name: 'Perfume X',
      sku: 'PRF-001',
      description: 'Cheiro bom',
      imageUrl: 'https://example.com/x.png',
      errors: [],
    };

    expect(toPreviewRow(raw)).toEqual({
      lineNumber: 2,
      name: 'Perfume X',
      sku: 'PRF-001',
      description: 'Cheiro bom',
      imageUrl: 'https://example.com/x.png',
      errors: [],
      isValid: true,
    });
  });

  it('maps an invalid row (with errors)', () => {
    const raw = {
      lineNumber: 3,
      name: '',
      sku: null,
      description: null,
      imageUrl: '',
      errors: ['Nome é obrigatório', 'Imagem é obrigatória'],
    };

    expect(toPreviewRow(raw).isValid).toBe(false);
  });
});

describe('toConfirmRow', () => {
  it('maps a created row (productId present, no errors)', () => {
    const raw = {
      lineNumber: 2,
      name: 'Perfume X',
      sku: 'PRF-001',
      description: null,
      imageUrl: 'https://example.com/x.png',
      productId: 'p1',
      errors: [],
    };

    expect(toConfirmRow(raw)).toEqual({
      lineNumber: 2,
      name: 'Perfume X',
      sku: 'PRF-001',
      description: null,
      imageUrl: 'https://example.com/x.png',
      productId: 'p1',
      errors: [],
      isValid: true,
    });
  });

  it('maps a rejected row (no productId, with errors)', () => {
    const raw = {
      lineNumber: 4,
      name: 'Perfume Y',
      sku: null,
      description: null,
      imageUrl: 'https://example.com/y.png',
      productId: null,
      errors: ['Não foi possível obter a imagem dessa URL'],
    };

    const row = toConfirmRow(raw);
    expect(row.isValid).toBe(false);
    expect(row.productId).toBeNull();
  });
});
