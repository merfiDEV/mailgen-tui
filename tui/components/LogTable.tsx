import React from "react";
import { Box, Text, ScrollView } from "@semos-labs/glyph";

export interface LogEntry {
  id: number;
  email: string;
  password: string;
  provider: string;
  status: "OK" | "FAIL" | "INFO";
  message: string;
}

interface LogTableProps {
  entries: LogEntry[];
}

const STATUS_COLORS: Record<string, string> = {
  OK: "green",
  FAIL: "red",
  INFO: "yellow",
};

export function LogTable({ entries }: LogTableProps) {
  if (entries.length === 0) {
    return (
      <Box style={{ padding: 1 }}>
        <Text style={{ dim: true }}>Нет данных</Text>
      </Box>
    );
  }

  return (
    <ScrollView style={{ height: 15 }}>
      <Box style={{ flexDirection: "column" }}>
        <Box style={{ flexDirection: "row", gap: 1, bold: true, color: "cyan" }}>
          <Text style={{ width: 30 }}>Email</Text>
          <Text style={{ width: 20 }}>Пароль</Text>
          <Text style={{ width: 12 }}>Провайдер</Text>
          <Text style={{ width: 8 }}>Статус</Text>
        </Box>

        {entries.map((entry) => (
          <Box key={entry.id} style={{ flexDirection: "row", gap: 1 }}>
            <Text style={{ width: 30 }}>{entry.email || "—"}</Text>
            <Text style={{ width: 20, dim: true }}>
              {entry.password ? "••••••••" : "—"}
            </Text>
            <Text style={{ width: 12, color: "whiteBright" }}>
              {entry.provider || "—"}
            </Text>
            <Text
              style={{
                width: 8,
                color: STATUS_COLORS[entry.status] as any || "white",
                bold: entry.status === "OK",
              }}
            >
              {entry.status}
            </Text>
          </Box>
        ))}
      </Box>
    </ScrollView>
  );
}
