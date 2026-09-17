'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileInput } from '@/components/ui/file-input';
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="csv-file">Arquivo CSV</Label>
        <FileInput
          id="csv-file"
          accept=".csv,text/csv"
          disabled={preview.isPending}
          buttonLabel="Escolher arquivo CSV"
          fileName={file?.name}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setPreviewRows(null);
          }}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-fit"
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
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2">
            {previewRows.map((row) => (
              <li
                key={row.lineNumber}
                className="border-border flex flex-col gap-1 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {row.name || `Linha ${row.lineNumber}`}
                  </span>
                  <Badge variant={row.isValid ? 'outline' : 'destructive'}>
                    {row.isValid ? 'Válida' : 'Com erro'}
                  </Badge>
                </div>
                {row.errors.map((error) => (
                  <p
                    key={error}
                    role="alert"
                    className="text-destructive text-sm"
                  >
                    {error}
                  </p>
                ))}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            className="w-fit"
            disabled={!hasValidRows || confirm.isPending}
            onClick={() => file && confirm.mutate({ catalogId, file })}
          >
            Confirmar importação
          </Button>
        </div>
      )}

      {confirm.data && (
        <ul className="flex flex-col gap-2">
          {confirm.data.map((row) => (
            <li
              key={row.lineNumber}
              className="border-border flex items-center justify-between gap-2 border-b py-2 text-sm"
            >
              <span>{row.name}</span>
              <Badge variant={row.productId ? 'outline' : 'destructive'}>
                {row.productId ? 'Criado' : 'Recusado'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {confirmErrorMessage(confirm.error) && (
        <p role="alert" className="text-destructive text-sm">
          {confirmErrorMessage(confirm.error)}
        </p>
      )}
    </div>
  );
}
