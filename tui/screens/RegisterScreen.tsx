import React, { useState, useCallback, useMemo } from "react";
import { Box, Text, Input, Button, Checkbox, ScrollView } from "@semos-labs/glyph";
import { Database } from "../../core/models/database.js";
import { createRegistration } from "../../core/models/registration.js";
import { isValidUrl } from "../../core/utils/validators.js";

interface RegisterScreenProps {
  db: Database;
  config: any;
  onLog: (msg: string) => void;
}

interface LogLine {
  id: number;
  text: string;
  color: string;
}

export function RegisterScreen({ db, config, onLog }: RegisterScreenProps) {
  const [siteUrl, setSiteUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(true);
  const [useAllAccounts, setUseAllAccounts] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const nextId = React.useRef(1);

  const accounts = useMemo(() => db.getActiveAccounts(), [db]);
  const filteredAccounts = useAllAccounts
    ? accounts
    : accounts.filter((a) => selectedEmails.includes(a.email));

  const addLog = useCallback((text: string, color = "white") => {
    setLogLines((prev) => [...prev, { id: nextId.current++, text, color }]);
  }, []);

  const toggleEmail = useCallback((email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  }, []);

  const handleRegister = useCallback(async () => {
    let url = siteUrl.trim();
    if (!url) {
      addLog("Введите URL сайта", "red");
      return;
    }
    if (!isValidUrl(url)) {
      url = "https://" + url;
      setSiteUrl(url);
    }

    if (!useAllAccounts && selectedEmails.length === 0) {
      addLog("Выберите аккаунты", "red");
      return;
    }

    setRunning(true);
    setLogLines([]);

    for (const acc of filteredAccounts) {
      addLog(`[${acc.email}] Начинаю регистрацию на ${url}...`, "cyan");

      const reg = createRegistration({
        accountEmail: acc.email,
        siteUrl: url,
        siteName: siteName || url,
        status: "active",
      });

      db.addRegistration(reg);
      addLog(`[${acc.email}] Регистрация сохранена ✓`, "green");
    }

    addLog("--- Регистрация завершена ---", "yellow");
    setRunning(false);
  }, [siteUrl, siteName, confirmEmail, useAllAccounts, selectedEmails, filteredAccounts, db, addLog]);

  return (
    <Box style={{ flexDirection: "column", padding: 1, gap: 1 }}>
      <Text style={{ bold: true, color: "cyan" }}>Регистрация на Сайтах</Text>

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Text style={{ bold: true, color: "cyan" }}>URL:</Text>
        <Input value={siteUrl} onChange={setSiteUrl} placeholder="https://example.com" />
        <Text style={{ bold: true, color: "cyan" }}>Название:</Text>
        <Input value={siteName} onChange={setSiteName} placeholder="MySite" />
      </Box>

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Checkbox checked={confirmEmail} onChange={setConfirmEmail} label="Подтверждать email" />
        <Checkbox checked={useAllAccounts} onChange={setUseAllAccounts} label="Все аккаунты" />
      </Box>

      {!useAllAccounts && (
        <Box style={{ flexDirection: "column" }}>
          <Text style={{ color: "whiteBright", bold: true }}>Выбрать аккаунты:</Text>
          <ScrollView style={{ height: 6 }}>
            <Box style={{ flexDirection: "column" }}>
              {accounts.map((acc) => (
                <Box key={acc.id} style={{ flexDirection: "row", gap: 1 }}>
                  <Checkbox
                    checked={selectedEmails.includes(acc.email)}
                    onChange={() => toggleEmail(acc.email)}
                    label={acc.email}
                  />
                </Box>
              ))}
            </Box>
          </ScrollView>
          <Text style={{ dim: true }}>Выбрано: {selectedEmails.length} / {accounts.length}</Text>
        </Box>
      )}

      <Button onPress={handleRegister} disabled={running}>
        <Text style={{ color: running ? "whiteBright" : "white", bold: true }}>
          {running ? "Регистрация..." : "▶ Зарегистрироваться"}
        </Text>
      </Button>

      <Box style={{ flexDirection: "column", border: "round", borderColor: "whiteBright", padding: 1 }}>
        <Text style={{ color: "whiteBright", bold: true }}>Лог:</Text>
        <ScrollView style={{ height: 10 }}>
          {logLines.map((line) => (
            <Text key={line.id} style={{ color: line.color as any }}>
              {line.text}
            </Text>
          ))}
          {logLines.length === 0 && <Text style={{ dim: true }}>Нет сообщений</Text>}
        </ScrollView>
      </Box>
    </Box>
  );
}
