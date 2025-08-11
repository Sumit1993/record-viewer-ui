import { Box, Typography, Button } from "@mui/material";

export type HeaderProps = {
  title: string;
  totalRecords: number;
  lastUpdated: string;
  activeFilters: number;
  onAddNewRecord?: () => void;
};

export default function Header({
  title,
  totalRecords,
  lastUpdated,
  activeFilters,
  onAddNewRecord,
}: HeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 2,
        borderBottom: "1px solid #eee",
        background: "#fff",
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Total Records: {totalRecords} &nbsp; | &nbsp; Last Updated: {lastUpdated} &nbsp; | &nbsp; Active Filters: {activeFilters}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ borderRadius: 2, fontWeight: 500 }}
        onClick={onAddNewRecord}
      >
        Add New Record
      </Button>
    </Box>
  );
}
