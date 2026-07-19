import React from "react";
import { Box, Text, Button } from "@semos-labs/glyph";

export type TabId = "generator" | "accounts" | "register" | "settings";

interface TabDef {
  id: TabId;
  label: string;
  shortcut: string;
}

const TABS: TabDef[] = [
  { id: "generator", label: "Генератор", shortcut: "1" },
  { id: "accounts", label: "Аккаунты", shortcut: "2" },
  { id: "register", label: "Регистрация", shortcut: "3" },
  { id: "settings", label: "Настройки", shortcut: "4" },
];

interface TabBarProps {
  active: TabId;
  onSelect: (id: TabId) => void;
}

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <Box style={{ flexDirection: "row", gap: 1, padding: 1 }}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Button
            key={tab.id}
            onPress={() => onSelect(tab.id)}
          >
            <Text
              style={{
                color: isActive ? "white" : "whiteBright",
                dim: !isActive,
                bold: isActive,
              }}
            >
              {`[${tab.shortcut}] ${tab.label}`}
            </Text>
          </Button>
        );
      })}
    </Box>
  );
}
