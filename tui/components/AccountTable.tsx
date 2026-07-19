import React from "react";
import { Box, Text, ScrollView, Button } from "@semos-labs/glyph";
import { Account } from "../../core/models/account.js";

interface AccountTableProps {
  accounts: Account[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}

export function AccountTable({ accounts, selectedIdx, onSelect }: AccountTableProps) {
  if (accounts.length === 0) {
    return (
      <Box style={{ padding: 1 }}>
        <Text style={{ dim: true }}>Нет аккаунтов</Text>
      </Box>
    );
  }

  return (
    <ScrollView style={{ height: 12 }}>
      <Box style={{ flexDirection: "column" }}>
        <Box style={{ flexDirection: "row", gap: 1, bold: true, color: "cyan" }}>
          <Text style={{ width: 5 }}>ID</Text>
          <Text style={{ width: 35 }}>Email</Text>
          <Text style={{ width: 12 }}>Провайдер</Text>
          <Text style={{ width: 10 }}>Статус</Text>
          <Text style={{ width: 16 }}>Создан</Text>
        </Box>

        {accounts.map((acc, idx) => {
          const isSelected = idx === selectedIdx;
          return (
            <Button
              key={acc.id}
              onPress={() => onSelect(idx)}
            >
              <Box
                style={{
                  flexDirection: "row",
                  gap: 1,
                  bg: isSelected ? "blue" : undefined,
                }}
              >
                <Text style={{ width: 5, color: isSelected ? "white" : acc.status === "active" ? "green" : "red" }}>
                  {String(acc.id || "").padEnd(5)}
                </Text>
                <Text style={{ width: 35, color: "white" }}>
                  {acc.email}
                </Text>
                <Text style={{ width: 12, color: isSelected ? "white" : "whiteBright" }}>
                  {acc.provider}
                </Text>
                <Text style={{ width: 10, color: acc.status === "active" ? "green" : "red" }}>
                  {acc.status}
                </Text>
                <Text style={{ width: 16, dim: true }}>
                  {acc.createdAt.toLocaleDateString("ru-RU")}
                </Text>
              </Box>
            </Button>
          );
        })}
      </Box>
    </ScrollView>
  );
}
