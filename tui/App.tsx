import React, { useState, useCallback } from "react";
import { Box, Text, useApp, useInput, Key } from "@semos-labs/glyph";
import { normalizeKeyName } from "../core/utils/keymap.js";
import fs from "fs";
import { Database } from "../core/models/database.js";
import { TabBar, TabId } from "./components/TabBar.js";
import { GeneratorScreen } from "./screens/GeneratorScreen.js";
import { AccountsScreen } from "./screens/AccountsScreen.js";
import { RegisterScreen } from "./screens/RegisterScreen.js";
import { SettingsScreen } from "./screens/SettingsScreen.js";

interface AppSettings {
  browserType: string;
  browserPath: string;
  maxThreads: number;
  warnOnGenerate: number;
  dbPath: string;
  proxyEnabled: boolean;
  checkIntervalHours: number;
  emailProviderPriority: string[];
}

const DEFAULT_SETTINGS: AppSettings = {
  browserType: "chromium",
  browserPath: "",
  maxThreads: 3,
  warnOnGenerate: 50,
  dbPath: "data/accounts.db",
  proxyEnabled: false,
  checkIntervalHours: 24,
  emailProviderPriority: ["mailtm", "tempmail"],
};

function loadConfig(): AppSettings {
  try {
    if (fs.existsSync("config.json")) {
      const raw = fs.readFileSync("config.json", "utf-8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveConfig(config: AppSettings) {
  try {
    fs.writeFileSync("config.json", JSON.stringify(config, null, 2), "utf-8");
  } catch {}
}

export function App() {
  const { exit } = useApp();

  useInput((key: Key) => {
    const normalized = normalizeKeyName(key.name);
    if (normalized === "escape" || normalized === "q") {
      exit();
    }
  });
  const [activeTab, setActiveTab] = useState<TabId>("generator");
  const [config, setConfig] = useState<AppSettings>(loadConfig);
  const [db] = useState(() => new Database());
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const handleLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("ru-RU");
    setLogMessages((prev) => [...prev.slice(-50), `[${ts}] ${msg}`]);
  }, []);

  const handleConfigChange = useCallback((newConfig: AppSettings) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  }, []);

  const handleTabShortcut = useCallback(
    (tabId: TabId) => () => setActiveTab(tabId),
    []
  );

  const renderScreen = () => {
    switch (activeTab) {
      case "generator":
        return <GeneratorScreen db={db} config={config} onLog={handleLog} />;
      case "accounts":
        return <AccountsScreen db={db} onLog={handleLog} />;
      case "register":
        return <RegisterScreen db={db} config={config} onLog={handleLog} />;
      case "settings":
        return (
          <SettingsScreen
            config={config}
            onConfigChange={handleConfigChange}
            onLog={handleLog}
          />
        );
    }
  };

  return (
    <Box style={{ flexDirection: "column" }}>
      {/* Header */}
      <Box style={{ flexDirection: "row", padding: 1, gap: 2, border: "round", borderColor: "whiteBright" }}>
        <Text style={{ bold: true, color: "white" }}>
          ✉ Email Generator TUI v1.0
        </Text>
        <Text style={{ color: "whiteBright" }}>
          {db.getAccountsCount()} аккаунтов | {db.getActiveRegistrations().length} регистраций
        </Text>
      </Box>

      {/* Tabs */}
      <TabBar active={activeTab} onSelect={setActiveTab} />



      {/* Content */}
      <Box style={{ flexDirection: "column" }}>
        {renderScreen()}
      </Box>

      {/* Footer log */}
      <Box style={{ flexDirection: "column", border: "round", borderColor: "whiteBright", padding: 1 }}>
        <Text style={{ color: "whiteBright", bold: true }}>Лог:</Text>
        {logMessages.length > 0 ? (
          logMessages.slice(-3).map((msg, i) => (
            <Text key={i} style={{ color: "whiteBright" }}>
              {msg}
            </Text>
          ))
        ) : (
          <Text style={{ dim: true }}>Нет сообщений</Text>
        )}
      </Box>


    </Box>
  );
}
