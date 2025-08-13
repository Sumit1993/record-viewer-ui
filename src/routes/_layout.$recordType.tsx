import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import Header from '~/components/Header'
import RecordsTable, { RecordRow } from '~/components/RecordsTable'
import { ColumnOption } from '~/components/ColumnSelectionDrawer'
import ColumnSelectionDrawer from '~/components/ColumnSelectionDrawer'
import AdvanceFilterDrawer from '~/components/ColumnSelectionDrawer' // reuse for now
import { Box, Button, CircularProgress, Typography, Pagination } from '@mui/material'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRecords } from '../api/records'

export const Route = createFileRoute('/_layout/$recordType')({
  component: RouteComponent,
})

function RouteComponent() {
  // --- Filter State Types ---
  type FilterCondition = {
    operator: 'is' | 'is not';
    value: string;
    id: string;
  };
  type FilterGroup = {
    field: string;
    conditions: FilterCondition[];
    id: string;
  };
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [stagedFilterGroups, setStagedFilterGroups] = useState<FilterGroup[] | null>(null);

  
  // Column selection state
  const allColumns: ColumnOption[] = [
    { id: "recordNumber", label: "Record #", default: true },
    { id: "recordType", label: "Record Type", default: true },
    { id: "applicantName", label: "Applicant Name", default: true },
    { id: "dateSubmitted", label: "Date Submitted", default: true },
    { id: "addresses", label: "Addresses", multiEntry: true },
    { id: "recordStatus", label: "Record Status", default: true },
    { id: "emails", label: "Emails", multiEntry: true },
    { id: "phoneNumbers", label: "Phone Numbers", multiEntry: true },
    { id: "description", label: "Description" },
    { id: "tenure", label: "Tenure (Years)" },
  ];
  const defaultColumns = allColumns.filter(c => c.default).map(c => c.id);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);
  const [stagedColumns, setStagedColumns] = useState<string[] | null>(null);
  
  // Get selectedType from Route context
  // Convert dashes in route param back to spaces for matching
  let { recordType: selectedType } = Route.useParams();
  selectedType = selectedType ? selectedType.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : selectedType;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const cleanedFilterGroups = filterGroups.map(group => ({
    field: group.field,
    conditions: group.conditions.map(condition => ({
      operator: condition.operator,
      value: condition.value,
    })),
  }));

  const { data, isLoading, isError, error } = useQuery<{ data: RecordRow[], meta: any }>({ 
    queryKey: ['records', selectedType, page, limit, JSON.stringify(cleanedFilterGroups), selectedColumns.join(',')], 
    queryFn: () => getRecords(page, limit, selectedType, JSON.stringify(cleanedFilterGroups), selectedColumns.join(',')), 
  });

  const recordsData = data?.data || [];
  const metaData = data?.meta;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'columns' | 'filters'>('columns'); // Default to columns

  // Calculate activeFilters from filterGroups
  const activeFilters = filterGroups.reduce((count, group) => {
    return count + group.conditions.filter(cond => cond.value.trim() !== "").length;
  }, 0);

  // Conditional rendering after all hooks
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (isError) {
    return <Typography color="error">Error: {error?.message}</Typography>;
  }

  return (
    <>
      <Header
        title="Records Dashboard"
        totalRecords={metaData?.total || 0}
        lastUpdated={metaData?.lastUpdated || '--'}
        activeFilters={activeFilters}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
        <Button variant="outlined" onClick={() => {
          setIsDrawerOpen(true);
          setDrawerMode('filters');
          setStagedFilterGroups(filterGroups); // Stage current filters
        }}>Filter</Button>
        <Button variant="outlined" onClick={() => {
          setIsDrawerOpen(true);
          setDrawerMode('columns');
          setStagedColumns(selectedColumns); // Stage current columns
        }}>Columns</Button>
      </Box>
      {/* Dynamically build columns array based on selectedColumns */}
      <RecordsTable
        data={recordsData}
        columns={selectedColumns.map(col => ({
          accessorKey: allColumns.find(column => column.id === col)?.id,
          header: allColumns.find(column => column.id === col)?.label,
          cell: (info: any) => {
            const value = info.getValue();
            if (Array.isArray(value)) return value.join(", ");
            if (typeof value === "undefined" || value === null) return "";
            return value;
          },
        }))}
      />
      {metaData && metaData.total > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(metaData.total / limit)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
      <ColumnSelectionDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setStagedColumns(null);
          setStagedFilterGroups(null);
        }}
        mode={drawerMode}

        // Props for Columns mode
        selectedColumns={stagedColumns ?? selectedColumns}
        onColumnsChange={setStagedColumns}
        onApplyColumns={() => {
          setSelectedColumns(stagedColumns ?? selectedColumns);
          setIsDrawerOpen(false);
          setStagedColumns(null);
        }}

        // Props for Filter mode
        filterGroups={stagedFilterGroups ?? filterGroups}
        onFilterGroupsChange={setStagedFilterGroups}
        onApplyFilters={() => {
          setFilterGroups(stagedFilterGroups ?? filterGroups);
          setIsDrawerOpen(false);
          setStagedFilterGroups(null);
        }}
      />
    </>
  )
}