type CsvImportLogResponseBody = {
  catalogId: string;
  confirmedAt: string;
  acceptedCount: number;
  rejectedCount: number;
};

export type CsvImportLog = {
  catalogId: string;
  confirmedAt: string;
  acceptedCount: number;
  rejectedCount: number;
};

export function toCsvImportLog(body: CsvImportLogResponseBody): CsvImportLog {
  return {
    catalogId: body.catalogId,
    confirmedAt: body.confirmedAt,
    acceptedCount: body.acceptedCount,
    rejectedCount: body.rejectedCount,
  };
}
