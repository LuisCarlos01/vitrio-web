'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api/errors';
import type { PreviewRow } from '@/lib/api/adapters/csv-import';
import {
  useConfirmCsvImport,
  usePreviewCsvImport,
} from '../hooks/use-csv-import';

function confirmErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 429) {
    return 'Muitas tentativas. Aguarde um instante e tente novamente.';
  }
  return 'Não foi possível confirmar a importação. Tente novamente.';
}

export function CsvImportForm({ catalogId }: { catalogId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[] | null>(null);
  const preview = usePreviewCsvImport();
  const confirm = useConfirmCsvImport();

  const hasValidRows = previewRows?.some((row) => row.isValid) ?? false;

  return (
    <div>
      <Label htmlFor="csv-file">Arquivo CSV</Label>
      <input
        id="csv-file"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setPreviewRows(null);
        }}
      />
      <Button
        type="button"
        disabled={!file || preview.isPending}
        onClick={() => {
          if (!file) return;
          preview.mutate(
            { catalogId, file },
            { onSuccess: (rows) => setPreviewRows(rows) },
          );
        }}
      >
        Pré-visualizar
      </Button>

      {previewRows && (
        <>
          <ul>
            {previewRows.map((row) => (
              <li key={row.lineNumber}>
                <span>{row.name || `Linha ${row.lineNumber}`}</span>
                {row.errors.map((error) => (
                  <p key={error} role="alert">
                    {error}
                  </p>
                ))}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            disabled={!hasValidRows || confirm.isPending}
            onClick={() => file && confirm.mutate({ catalogId, file })}
          >
            Confirmar importação
          </Button>
        </>
      )}

      {confirm.data && (
        <ul>
          {confirm.data.map((row) => (
            <li key={row.lineNumber}>
              {row.productId ? `${row.name}: criado` : `${row.name}: recusado`}
            </li>
          ))}
        </ul>
      )}
      {confirmErrorMessage(confirm.error) && (
        <p role="alert">{confirmErrorMessage(confirm.error)}</p>
      )}
    </div>
  );
}
