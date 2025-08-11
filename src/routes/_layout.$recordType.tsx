import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import Header from '~/components/Header'
import RecordsTable, { RecordRow } from '~/components/RecordsTable'
import { ColumnOption } from '~/components/ColumnSelectionDrawer'
import ColumnSelectionDrawer from '~/components/ColumnSelectionDrawer'
import AdvanceFilterDrawer from '~/components/ColumnSelectionDrawer' // reuse for now
import { Box, Button } from '@mui/material'
import React, { useState } from 'react'
import recordsDataRaw from '../data/recordsData.json';

export const Route = createFileRoute('/_layout/$recordType')({
  component: RouteComponent,
})

const recordsData: RecordRow[] = Array.isArray(recordsDataRaw) ? recordsDataRaw : [];

function RouteComponent() {
  // Get selectedType from Route context
  // Convert dashes in route param back to spaces for matching
  let { recordType: selectedType } = Route.useParams();
  selectedType = selectedType ? selectedType.replace(/-/g, ' ') : selectedType;

  // All available record types for sidebar tabs
  const allRecordTypes = Array.from(new Set(recordsData.map(r => r.recordType)));

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
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

  // Filter data based on selectedType (if needed)
  const [filteredRecords, setFilteredRecords] = useState<RecordRow[]>(() => {
    if (selectedType) {
      return recordsData.filter(r => r.recordType.trim().toLowerCase() === selectedType.trim().toLowerCase());
    }
    return recordsData;
  });

  // --- Filter Logic ---
  React.useEffect(() => {
    // Only filter by recordType unless filters are applied
    if (!filterGroups || filterGroups.length === 0) {
      if (selectedType) {
        setFilteredRecords(recordsData.filter(r => r.recordType.trim().toLowerCase() === selectedType.trim().toLowerCase()));
      } else {
        setFilteredRecords(recordsData);
      }
      return;
    }
    // Filtering logic: AND between groups, OR within conditions
    let base = selectedType
      ? recordsData.filter(r => r.recordType.trim().toLowerCase() === selectedType.trim().toLowerCase())
      : recordsData;
    // Only filter if at least one group has a non-empty condition
    const activeGroups = filterGroups.filter(group => group.conditions.some(cond => cond.value.trim() !== ""));
    if (activeGroups.length === 0) {
      setFilteredRecords(base);
      return;
    }
    const filtered = base.filter((row) => {
      const rowObj = row as Record<string, any>;
      return activeGroups.every((group) => {
        // For each group, at least one condition must match (OR)
        return group.conditions
          .filter(cond => cond.value.trim() !== "")
          .some((cond) => {
            const fieldValue = rowObj[group.field];
            if (Array.isArray(fieldValue)) {
              // For multi-entry fields, check if any entry contains the filter value
              return fieldValue.some((v: any) => {
                const val = String(v).toLowerCase();
                const filterVal = cond.value.toLowerCase();
                if (cond.operator === 'is') {
                  return val.includes(filterVal);
                } else {
                  return !val.includes(filterVal);
                }
              });
            } else {
              // For single value fields, check if value contains the filter value
              const val = String(fieldValue ?? '').toLowerCase();
              const filterVal = cond.value.toLowerCase();
              if (cond.operator === 'is') {
                return val.includes(filterVal);
              } else {
                return !val.includes(filterVal);
              }
            }
          });
      });
    });
    setFilteredRecords(filtered);
  }, [filterGroups, selectedType]);

  // Calculate lastUpdated from filteredRecords
  const lastUpdated = filteredRecords.length > 0
    ? filteredRecords.reduce((latest, r) => {
        return (!latest || new Date(r.dateSubmitted) > new Date(latest)) ? r.dateSubmitted : latest;
      }, "")
    : "";

  // Calculate activeFilters from filterGroups
  const activeFilters = filterGroups.reduce((count, group) => {
    return count + group.conditions.filter(cond => cond.value.trim() !== "").length;
  }, 0);

  return (
    <>
      <Header
        title="Records Dashboard"
        totalRecords={filteredRecords.length}
        lastUpdated={lastUpdated}
        activeFilters={activeFilters}
        onAddNewRecord={() => { /* TODO: handle navigation */ }}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
        <Button variant="outlined" onClick={() => setFilterDrawerOpen(true)}>Filter</Button>
        <Button variant="outlined" onClick={() => {
          setStagedColumns(selectedColumns);
          setDrawerOpen(true);
        }}>Columns</Button>
      </Box>
      {/* Dynamically build columns array based on selectedColumns */}
      <RecordsTable
        data={filteredRecords}
        columns={allColumns.filter(col => selectedColumns.includes(col.id)).map(col => ({
          accessorKey: col.id,
          header: col.label,
          cell: (info: any) => {
            const value = info.getValue();
            if (Array.isArray(value)) return value.join(", ");
            if (typeof value === "undefined" || value === null) return "";
            return value;
          },
        }))}
      />
      <ColumnSelectionDrawer
        open={drawerOpen}
        selectedColumns={stagedColumns ?? selectedColumns}
        onClose={() => {
          setDrawerOpen(false);
          setStagedColumns(null);
        }}
        onChange={setStagedColumns}
        onApply={() => {
          if (stagedColumns) setSelectedColumns(stagedColumns);
          setDrawerOpen(false);
          setStagedColumns(null);
        }}
      />
      {/* Advance Filter Drawer (reuse ColumnSelectionDrawer for now) */}
      <AdvanceFilterDrawer
        open={filterDrawerOpen}
        selectedColumns={selectedColumns}
        filterGroups={filterDrawerOpen ? (stagedFilterGroups ?? filterGroups) : filterGroups}
        setFilterGroups={filterDrawerOpen ? setStagedFilterGroups : setFilterGroups}
        onClose={() => {
          setFilterDrawerOpen(false);
          setStagedFilterGroups(null);
        }}
        onChange={() => {}} // not used for filters
        onApplyFilters={() => {
          setFilterGroups(stagedFilterGroups ?? filterGroups);
          setFilterDrawerOpen(false);
          setStagedFilterGroups(null);
        }}
      />
    </>
  )
}
