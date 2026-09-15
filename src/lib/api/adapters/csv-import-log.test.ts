import { describe, expect, it } from 'vitest';
import { toCsvImportLog } from './csv-import-log';

describe('toCsvImportLog', () => {
  it('maps the raw import log response body to a domain CsvImportLog', () => {
    const apiResponseBody = {
      catalogId: 'catalog-1',
      confirmedAt: '2026-09-10T12:00:00Z',
      acceptedCount: 8,
      rejectedCount: 2,
    };

    expect(toCsvImportLog(apiResponseBody)).toEqual({
      catalogId: 'catalog-1',
      confirmedAt: '2026-09-10T12:00:00Z',
      acceptedCount: 8,
      rejectedCount: 2,
    });
  });
});
