// app/(dashboard)/fields/page.tsx (example path) or wherever your page is
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Field, fieldApi } from '@/lib/api';

const ITEMS_PER_PAGE = 10;

export default function FieldsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery<{
    fields: Field[];
    total: number;
    pages: number;
  }>({
    queryKey: ['fields', currentPage],
    queryFn: async () => {
      const response = await fieldApi.getAllFields(currentPage, ITEMS_PER_PAGE);
      return response.data.data;
    },
  });

  const fields: Field[] = data?.fields ?? [];
  const totalPages = data?.pages ?? 1;
  const totalFields = data?.total ?? 0;

  const start = totalFields === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalFields);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Field Lists</h1>
        <p className="text-slate-500">Manage all fields and their owners</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Field</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Promotion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(7)
                          .fill(0)
                          .map((__, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-8 w-28" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                : fields.map((field) => {
                    const imageUrl = field?.images?.[0]?.url || '/placeholder.svg';
                    const ownerName = field?.owner?.name || 'Unknown';
                    const ownerEmail = field?.owner?.email || '-';

                    return (
                      <TableRow key={field._id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={imageUrl} alt={field.fieldName} />
                              <AvatarFallback>
                                {(field.fieldName || 'F').charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <p className="font-medium text-slate-900">
                                {field.fieldName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {field.fieldType}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-slate-600">
                          <div>
                            <p className="font-medium text-slate-900">{ownerName}</p>
                            <p className="text-xs text-slate-500">{ownerEmail}</p>
                          </div>
                        </TableCell>

                        <TableCell className="text-slate-600">
                          {field?.location?.address || '-'}
                        </TableCell>

                        <TableCell className="font-medium text-slate-900">
                          ${field.basePricePerHour}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              field.promotion
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {field.promotion ? 'Yes' : 'No'}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              field.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {field.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>

                        <TableCell className="text-slate-600">
                          {field.createdAt
                            ? new Date(field.createdAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing {start} to {end} of {totalFields} results
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'bg-teal-600 hover:bg-teal-700' : ''}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
