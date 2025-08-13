import { getAutocompleteSuggestions } from '../api/records'; // Added import
import React, { useState, useRef } from "react"; // Added useRef
// --- Dynamic Filter State Types ---
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
import {
  Drawer,
  Tabs,
  Tab,
  Box,
  Typography,
  List,
  ListItem,
  Checkbox,
  Chip,
  Button,
  ButtonGroup,
} from "@mui/material";

export type ColumnOption = {
  id: string;
  label: string;
  multiEntry?: boolean;
  default?: boolean;
};

const columnsList: ColumnOption[] = [
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

const recordTypeOptions = ['Business', 'Building Permit', 'Zoning Variance'];
const recordStatusOptions = ['Open', 'Closed', 'In Progress', 'On Hold'];

const autocompleteFields = ['applicantName', 'description']; // Added autocomplete fields

export interface ColumnSelectionDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: 'columns' | 'filters'; // New prop to indicate mode

  // Props for Columns mode
  selectedColumns?: string[];
  onColumnsChange?: (columns: string[]) => void;
  onApplyColumns?: () => void; // Renamed from onApply

  // Props for Filter mode
  filterGroups?: FilterGroup[];
  onFilterGroupsChange?: (groups: FilterGroup[]) => void; // Renamed from setFilterGroups
  onApplyFilters?: () => void;
}

export default function ColumnSelectionDrawer({
  open,
  onClose,
  mode, // New prop
  selectedColumns,
  onColumnsChange, // Renamed
  onApplyColumns, // Renamed
  filterGroups,
  onFilterGroupsChange, // Renamed from setFilterGroups
  onApplyFilters,
}: ColumnSelectionDrawerProps) {
  // Removed tab state

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFetchSuggestions = (field: string, query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (query.length < 2) { // Only fetch if query is at least 2 characters
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const fetchedSuggestions = await getAutocompleteSuggestions(field, query);
        setSuggestions(fetchedSuggestions);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce delay
  };

  // Helper for unique IDs
  const genId = () => Math.random().toString(36).slice(2, 10);

  // Add a new filter group (AND)
  const handleAddGroup = () => {
    if (onFilterGroupsChange && filterGroups) {
      onFilterGroupsChange([...filterGroups, {
        field: columnsList[0].id,
        conditions: [{
          operator: 'is',
          value: '',
          id: genId(),
        }],
        id: genId(),
      }]);
    }
  };

  // Add OR condition to a group (adds a new filter value, not a new group)
  const handleAddOrCondition = (groupIdx: number) => {
    if (onFilterGroupsChange && filterGroups) {
      onFilterGroupsChange(filterGroups.map((g, i) => i === groupIdx ? {
        ...g,
        conditions: [...g.conditions, {
          operator: 'is',
          value: '',
          id: genId(),
        }],
      } : g));
    }
  };

  // Remove a condition from a group
  const handleRemoveCondition = (groupIdx: number, condIdx: number) => {
    if (onFilterGroupsChange && filterGroups) {
      onFilterGroupsChange(filterGroups.map((g: FilterGroup, i: number) => i === groupIdx ? {
        ...g,
        conditions: g.conditions.filter((_: FilterCondition, j: number) => j !== condIdx),
      } : g).filter((g: FilterGroup) => g.conditions.length > 0));
    }
  };

  // Remove a group
  const handleRemoveGroup = (groupIdx: number) => {
    if (onFilterGroupsChange && filterGroups) {
      onFilterGroupsChange(filterGroups.filter((_, i) => i !== groupIdx));
    }
  };

  // Update a condition field/operator/value
  const handleUpdateCondition = (groupIdx: number, condIdx: number, updates: Partial<FilterCondition>) => {
    if (onFilterGroupsChange && filterGroups) {
      onFilterGroupsChange(filterGroups.map((g: FilterGroup, i: number) => i === groupIdx ? {
        ...g,
        conditions: g.conditions.map((c: FilterCondition, j: number) => j === condIdx ? { ...c, ...updates } : c),
      } : g));
    }
  };

  const handleUpdateGroupField = (groupIdx: number, field: string) => {
    if (onFilterGroupsChange && filterGroups) {
      onFilterGroupsChange(filterGroups.map((g, i) => i === groupIdx ? {
        ...g,
        field,
      } : g));
    }
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    if (onFilterGroupsChange) {
      onFilterGroupsChange([]);
    }
  };

  const handleToggle = (id: string) => {
    if (onColumnsChange && selectedColumns) {
      if (selectedColumns.includes(id)) {
        onColumnsChange(selectedColumns.filter((col) => col !== id));
      } else {
        onColumnsChange([...selectedColumns, id]);
      }
    }
  };

  const handleSelectAll = () => {
    if (onColumnsChange) {
      onColumnsChange(columnsList.map((col) => col.id));
    }
  };

  const handleClearAll = () => {
    if (onColumnsChange) {
      onColumnsChange([]);
    }
  };

  const handleDefault = () => {
    if (onColumnsChange) {
      onColumnsChange(columnsList.filter((col) => col.default).map((col) => col.id));
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 340, p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        {mode === 'filters' && filterGroups && ( // Conditionally render filters
          <>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Advance Filters</Typography>
              {filterGroups.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: '#888', py: 6 }}>
                  <Typography>No filters added yet.<br />Click "Add Filter" to get started.</Typography>
                  <Button variant="outlined" sx={{ mt: 3, borderStyle: 'dashed' }} onClick={handleAddGroup}>
                    + Add Filter
                  </Button>
                </Box>
              ) : (
                <>
                  {filterGroups.map((group, groupIdx) => (
                    <React.Fragment key={group.id}>
                    <Box key={group.id} sx={{ mb: 3, border: '1px solid #eee', borderRadius: 2, p: 2, background: '#fafbfc', minWidth: 0 }}>
                      <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fff', position: 'relative', minWidth: 0 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Column Name</Typography>
                            <Button variant="text" color="error" size="small" sx={{ minWidth: 32, fontSize: 18, py: 0.5 }} onClick={() => handleRemoveGroup(groupIdx)}>×</Button>
                          </Box>
                          <select
                            value={group.field}
                            onChange={e => handleUpdateGroupField(groupIdx, e.target.value)}
                            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }}
                          >
                            {columnsList.map(col => (
                              <option key={col.id} value={col.id}>{col.label}</option>
                            ))}
                          </select>
                          {group.conditions.map((cond: FilterCondition, condIdx: number) => (
                            <React.Fragment key={cond.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <input
                                    type="radio"
                                    checked={cond.operator === 'is'}
                                    onChange={() => handleUpdateCondition(groupIdx, condIdx, { operator: 'is' })}
                                  /> is
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <input
                                    type="radio"
                                    checked={cond.operator === 'is not'}
                                    onChange={() => handleUpdateCondition(groupIdx, condIdx, { operator: 'is not' })}
                                  /> is not
                                </label>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                {group.field === 'recordType' ? (
                                  <select
                                    value={cond.value}
                                    onChange={e => handleUpdateCondition(groupIdx, condIdx, { value: e.target.value })}
                                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 100 }}
                                  >
                                    {recordTypeOptions.map(option => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : group.field === 'recordStatus' ? (
                                  <select
                                    value={cond.value}
                                    onChange={e => handleUpdateCondition(groupIdx, condIdx, { value: e.target.value })}
                                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 100 }}
                                  >
                                    {recordStatusOptions.map(option => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <Box sx={{ position: 'relative', flex: 1 }}>
                                    <input
                                      type="text"
                                      value={cond.value}
                                      onChange={e => {
                                        handleUpdateCondition(groupIdx, condIdx, { value: e.target.value });
                                        if (autocompleteFields.includes(group.field)) {
                                          debouncedFetchSuggestions(group.field, e.target.value);
                                        }
                                      }}
                                      style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                                      placeholder="Value"
                                    />
                                    {loadingSuggestions && (
                                      <Typography variant="caption" sx={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', color: '#888' }}>Loading...</Typography>
                                    )}
                                    {suggestions.length > 0 && !loadingSuggestions && autocompleteFields.includes(group.field) && (
                                      <List sx={{ position: 'absolute', zIndex: 1, width: '100%', bgcolor: 'background.paper', border: '1px solid #ccc', borderRadius: 1, mt: 0.5, maxHeight: 150, overflowY: 'auto' }}>
                                        {suggestions.map((suggestion, sIdx) => (
                                          <ListItem
                                            key={sIdx}
                                            onClick={() => {
                                              handleUpdateCondition(groupIdx, condIdx, { value: suggestion });
                                              setSuggestions([]); // Clear suggestions after selection
                                            }}
                                            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                          >
                                            <Typography>{suggestion}</Typography>
                                          </ListItem>
                                        ))}
                                      </List>
                                    )}
                                  </Box>
                                )}
                                <Button variant="text" color="error" size="small" sx={{ minWidth: 32, fontSize: 18, py: 0.5 }} onClick={() => handleRemoveCondition(groupIdx, condIdx)}>×</Button>
                              </Box>
                              {condIdx < group.conditions.length - 1 && (
                                <Box sx={{ textAlign: 'center', mt: 0, mb: 2 }}>
                                  <Typography variant="caption" sx={{ color: '#888', fontWeight: 500 }}>OR</Typography>
                                </Box>
                              )}
                            </React.Fragment>
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Button variant="text" sx={{ color: '#1976d2', fontWeight: 600, fontSize: 15, textTransform: 'none', px: 0 }} onClick={() => handleAddOrCondition(groupIdx)}>+ ADD OR CONDITION</Button>
                      </Box>
                    </Box>
                    <>
                    {groupIdx < filterGroups.length - 1 && (
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Typography variant="caption" sx={{ color: '#43a047', fontWeight: 600 }}>AND</Typography>
                      </Box>
                    )}
                    </>
                    </React.Fragment>
                  ))}
                  <Button variant="outlined" sx={{ borderStyle: 'dashed', width: '100%', fontWeight: 600, fontSize: 15, textTransform: 'none', py: 1 }} onClick={handleAddGroup}>
                    + ADD FILTER
                  </Button>
                </>
              )}
            </Box>
            <Box sx={{ mt: "auto", display: "flex", gap: 2, pb: 1 }}>
              <Button variant="outlined" onClick={handleClearAllFilters} sx={{ flex: 1, fontWeight: 600, fontSize: 15, textTransform: 'none', py: 1 }}>CLEAR ALL</Button>
              <Button variant="contained" sx={{ flex: 1, fontWeight: 600, fontSize: 15, textTransform: 'none', py: 1 }} onClick={onApplyFilters}>APPLY FILTERS</Button>
            </Box>
          </>
        )}
        {mode === 'columns' && selectedColumns && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                {selectedColumns.length} of {columnsList.length} columns selected
              </Typography>
              <ButtonGroup size="small">
                <Button onClick={handleSelectAll}>Select All</Button>
                <Button onClick={handleDefault}>Default ({columnsList.filter(c => c.default).length})</Button>
                <Button onClick={handleClearAll}>Clear All</Button>
              </ButtonGroup>
            </Box>
            <List>
              {columnsList.map((col) => (
                <ListItem key={col.id} sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={selectedColumns.includes(col.id)}
                    onChange={() => handleToggle(col.id)}
                  />
                  <Typography sx={{ flex: 1 }}>{col.label}</Typography>
                  {col.multiEntry && (
                    <Chip label="Multi-entry" size="small" color="success" sx={{ ml: 1 }} />
                  )}
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: "auto", display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={onClose} sx={{ flex: 1 }}>Cancel</Button>
              <Button variant="contained" onClick={onApplyColumns} sx={{ flex: 1 }}>Apply Changes</Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}


