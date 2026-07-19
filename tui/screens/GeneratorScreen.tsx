import React, { useState, useCallback, useRef } from "react";
import { Box, Text, Input, Button, Select, Checkbox, Keybind } from "@semos-labs/glyph";
import { Database } from "../../core/models/database.js";
import { createAccount } from "../../core/models/account.js";
import { getProvider, PROVIDERS } from "../../core/providers/index.js";
import { generateName } from "../../core/utils/validators.js";
import { LogTable, LogEntry } from "../components/LogTable.js";
import { ProgressBar } from "../components/ProgressBar.js";

interface GeneratorScreenProps {
  db: Database;
  config: any;
  onLog: (msg: string) => void;
}

export function GeneratorScreen({ db, config, onLog }: GeneratorScreenProps) {
  const [prefix, setPrefix] = useState("");
  const [count, setCount] = useState("10");
  const [providerKey, setProviderKey] = useState("mailtm");
  const [autoLogin, setAutoLogin] = useState(false);
  const [sequential, setSequential] = useState(true);
  const [fallback, setFallback] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const nextId = useRef(1);

  const addEntry = useCallback((entry: Omit<LogEntry, "id">) => {
    setLogEntries((prev) => [...prev, { ...entry, id: nextId.current++ }]);
  }, []);

  const handleGenerate = useCallback(async () => {
    const num = parseInt(count, 10);
    if (isNaN(num) || num < 1) return;

    setRunning(true);
    setLogEntries([]);
    setProgress({ current: 0, total: num });
    onLog(`Starting generation of ${num} accounts...`);

    const priority = [providerKey];
    if (fallback) {
      for (const k of Object.keys(PROVIDERS)) {
        if (k !== providerKey) priority.push(k);
      }
    }

    let providerIndex = 0;
    let errorsThisProvider = 0;
    const maxErrors = 5;

    for (let i = 0; i < num; i++) {
      const providerName = priority[providerIndex];

      try {
        const provider = getProvider(providerName, prefix);
        const emailAcc = await provider.createAccount();
        errorsThisProvider = 0;
        const { firstName, lastName } = generateName();

        const account = createAccount({
          email: emailAcc.email,
          password: emailAcc.password,
          provider: providerName,
          token: emailAcc.token,
          accountId: emailAcc.accountId,
          firstName,
          lastName,
        });

        db.addAccount(account);
        addEntry({
          email: emailAcc.email,
          password: emailAcc.password,
          provider: providerName,
          status: "OK",
          message: "Created",
        });
        onLog(`Created: ${emailAcc.email}`);
      } catch (e: any) {
        errorsThisProvider++;
        addEntry({ email: "", password: "", provider: providerName, status: "FAIL", message: e.message });
        if (errorsThisProvider >= maxErrors) {
          providerIndex++;
          if (providerIndex >= priority.length) {
            addEntry({ email: "", password: "", provider: "-", status: "FAIL", message: "All providers exhausted" });
            break;
          }
        }
      }

      setProgress({ current: i + 1, total: num });
    }

    setRunning(false);
    onLog("Generation complete");
  }, [prefix, count, providerKey, fallback, db, onLog, addEntry]);

  return (
    <Box style={{ flexDirection: "column", padding: 1, gap: 1 }}>
      <Text style={{ bold: true, color: "cyan" }}>Генератор Email Аккаунтов</Text>

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Text>Префикс:</Text>
        <Input value={prefix} onChange={setPrefix} placeholder="ник (пусто = рандом)" />
        <Text>Кол-во:</Text>
        <Input value={count} onChange={setCount} placeholder="10" />
        <Select
          items={Object.keys(PROVIDERS).map((k) => ({ label: k, value: k }))}
          value={providerKey}
          onChange={(v) => v && setProviderKey(v)}
          placeholder="Провайдер"
        />
      </Box>

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Checkbox checked={autoLogin} onChange={setAutoLogin} label="Автовход" />
        <Checkbox checked={sequential} onChange={setSequential} label="Вход по очереди" />
        <Checkbox checked={fallback} onChange={setFallback} label="Fallback" />
      </Box>

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Button onPress={handleGenerate} disabled={running}>
          <Text style={{ color: running ? "whiteBright" : "white", bold: true }}>
            {running ? "Генерация..." : "▶ Генерировать"}
          </Text>
        </Button>
      </Box>

      {running && progress.total > 0 && (
        <ProgressBar current={progress.current} total={progress.total} />
      )}

      <LogTable entries={logEntries} />

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Text style={{ dim: true }}>
          Всего: {db.getAccountsCount()} | Активных: {db.getActiveAccounts().length}
        </Text>
      </Box>
    </Box>
  );
}
