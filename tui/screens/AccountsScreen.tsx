import React, { useState, useCallback, useMemo } from "react";
import { Box, Text, Button, Input } from "@semos-labs/glyph";
import { Database } from "../../core/models/database.js";
import { AccountTable } from "../components/AccountTable.js";

interface AccountsScreenProps {
  db: Database;
  onLog: (msg: string) => void;
}

export function AccountsScreen({ db, onLog }: AccountsScreenProps) {
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const accounts = useMemo(() => {
    void refreshKey;
    let all = db.getAllAccounts();
    if (search) {
      const q = search.toLowerCase();
      all = all.filter((a) => a.email.toLowerCase().includes(q));
    }
    return all;
  }, [db, search, refreshKey]);

  const registrations = useMemo(() => {
    void refreshKey;
    return db.getAllRegistrations();
  }, [db, refreshKey]);

  const selectedAccount = selectedIdx >= 0 ? accounts[selectedIdx] : null;
  const selectedRegs = selectedAccount
    ? db.getRegistrationsByEmail(selectedAccount.email)
    : [];

  const activeCount = accounts.filter((a) => a.status === "active").length;
  const inactiveCount = accounts.length - activeCount;

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    onLog("Accounts refreshed");
  }, [onLog]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedAccount) return;
    db.deleteAccount(selectedAccount.id!);
    setSelectedIdx(-1);
    setRefreshKey((k) => k + 1);
    onLog(`Deleted: ${selectedAccount.email}`);
  }, [selectedAccount, db, onLog]);

  const handleDeleteAll = useCallback(() => {
    const all = db.getAllAccounts();
    for (const acc of all) {
      db.deleteAccount(acc.id!);
    }
    setSelectedIdx(-1);
    setRefreshKey((k) => k + 1);
    onLog(`Deleted all ${all.length} accounts`);
  }, [db, onLog]);

  const handleExport = useCallback(() => {
    db.exportToFile("accounts_export.json");
    onLog("Exported to accounts_export.json");
  }, [db, onLog]);

  return (
    <Box style={{ flexDirection: "column", padding: 1, gap: 1 }}>
      <Text style={{ bold: true, color: "cyan" }}>Управление Аккаунтами</Text>

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Button onPress={handleRefresh}>
          <Text>⟳ Обновить</Text>
        </Button>
        <Button onPress={handleDeleteSelected}>
          <Text style={{ color: "red" }}>✕ Удалить</Text>
        </Button>
        <Button onPress={handleDeleteAll}>
          <Text style={{ color: "red" }}>✕ Удалить все</Text>
        </Button>
        <Button onPress={handleExport}>
          <Text>↓ Экспорт</Text>
        </Button>
      </Box>

      <Box style={{ flexDirection: "row", gap: 1 }}>
        <Text style={{ color: "whiteBright" }}>Поиск:</Text>
        <Input value={search} onChange={setSearch} placeholder="фильтр по email..." />
      </Box>

      <Text style={{ dim: true }}>
        Всего: {accounts.length} | Активных: {activeCount} | Неактивных: {inactiveCount} | Регистраций: {registrations.length}
      </Text>

      <AccountTable accounts={accounts} selectedIdx={selectedIdx} onSelect={setSelectedIdx} />

      {selectedAccount && (
        <Box style={{ flexDirection: "column", gap: 1, border: "round", borderColor: "cyan", padding: 1 }}>
          <Text style={{ bold: true, color: "yellow" }}>
            {selectedAccount.email} ({selectedAccount.provider})
          </Text>

          {selectedRegs.length > 0 ? (
            <Box style={{ flexDirection: "column" }}>
              <Text style={{ color: "whiteBright", bold: true }}>Регистрации:</Text>
              {selectedRegs.map((reg) => (
                <Box key={reg.id} style={{ flexDirection: "row", gap: 2 }}>
                  <Text style={{ width: 30 }}>{reg.siteName || reg.siteUrl}</Text>
                  <Text style={{ width: 12, color: "whiteBright" }}>
                    {reg.registeredAt.toLocaleDateString("ru-RU")}
                  </Text>
                  <Text style={{ width: 10, color: reg.status === "active" ? "green" : "red" }}>
                    {reg.status}
                  </Text>
                </Box>
              ))}
            </Box>
          ) : (
            <Text style={{ dim: true }}>Нет регистраций</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
