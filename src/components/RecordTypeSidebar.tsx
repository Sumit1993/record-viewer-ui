import { Drawer, Typography, List, ListItem, ListItemButton, Box } from "@mui/material";
import { CustomButtonLink } from "./CustomButtonLink";

type RecordTypeSidebarProps = {
  recordTypes: string[];
  selectedType: string;
  onSelectType: (type: string) => void;
};

export default function RecordTypeSidebar({ recordTypes, selectedType, onSelectType }: RecordTypeSidebarProps) {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 220,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 220,
          boxSizing: "border-box",
        },
      }}
      open
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" mb={2}>
          Record Types
        </Typography>
        <List>
          {recordTypes.map((type: string) => (
            <ListItem key={type} disablePadding>
              <ListItemButton
                selected={type === selectedType}
                component={CustomButtonLink}
                to={`/${type.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => onSelectType(type)}
              >
                {type}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}