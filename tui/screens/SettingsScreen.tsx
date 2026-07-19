import React, { useState, useCallback } from "react";
import { Box, Text, Input, Select, Button, Checkbox } from "@semos-labs/glyph";
import { getLogger } from "../../core/utils/logger.js";

const log = getLogger("Settings");

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

interface SettingsScreenProps {
  config: AppSettings;
  onConfigChange: (config: AppSettings) => void;
  onLog: (msg: string) => void;
}

const BROWSER_OPTIONS = [
  { label: "chromium", value: "chromium" },
  { label: "firefox", value: "firefox" },
  { label: "webkit", value: "webkit" },
];

export function SettingsScreen({ config, onConfigChange, onLog }: SettingsScreenProps) {
  const [browserType, setBrowserType] = useState(config.browserType);
  const [browserPath, setBrowserPath] = useState(config.browserPath);
  const [maxThreads, setMaxThreads] = useState(String(config.maxThreads));
  const [warnOnGenerate, setWarnOnGenerate] = useState(String(config.warnOnGenerate));
  const [dbPath, setDbPath] = useState(config.dbPath);
  const [proxyEnabled, setProxyEnabled] = useState(config.proxyEnabled);
  const [checkInterval, setCheckInterval] = useState(String(config.checkIntervalHours));
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    const newConfig: AppSettings = {
      ...config,
      browserType,
      browserPath,
      maxThreads: parseInt(maxThreads, 10) || 3,
      warnOnGenerate: parseInt(warnOnGenerate, 10) || 50,
      dbPath,
      proxyEnabled,
      checkIntervalHours: parseInt(checkInterval, 10) || 24,
    };
    onConfigChange(newConfig);
    setSaved(true);
    onLog("Settings saved");
    setTimeout(() => setSaved(false), 2000);
  }, [browserType, browserPath, maxThreads, warnOnGenerate, dbPath, proxyEnabled, checkInterval, config, onConfigChange, onLog]);

  return (
    <Box style={{ flexDirection: "column", padding: 1, gap: 1 }}>
      <Text style={{ bold: true, color: "cyan" }}>Настройки</Text>

      <Box style={{ flexDirection: "column" }}>
        <Text style={{ color: "whiteBright", bold: true }}>Браузер</Text>
        <Box style={{ flexDirection: "row", gap: 2 }}>
          <Text style={{ width: 20 }}>Тип браузера:</Text>
          <Select items={BROWSER_OPTIONS} value={browserType} onChange={(v) => v && setBrowserType(v)} />
        </Box>
        <Box style={{ flexDirection: "row", gap: 2 }}>
          <Text style={{ width: 20 }}>Путь к браузеру:</Text>
          <Input value={browserPath} onChange={setBrowserPath} placeholder="(пусто = авто)" />
        </Box>
      </Box>

      <Box style={{ flexDirection: "column" }}>
        <Text style={{ color: "whiteBright", bold: true }}>Потоки и лимиты</Text>
        <Box style={{ flexDirection: "row", gap: 2 }}>
          <Text style={{ width: 20 }}>Макс. потоков:</Text>
          <Input value={maxThreads} onChange={setMaxThreads} />
        </Box>
        <Box style={{ flexDirection: "row", gap: 2 }}>
          <Text style={{ width: 20 }}>Предупреждать при:</Text>
          <Input value={warnOnGenerate} onChange={setWarnOnGenerate} />
        </Box>
      </Box>

      <Box style={{ flexDirection: "column" }}>
        <Text style={{ color: "whiteBright", bold: true }}>Данные</Text>
        <Box style={{ flexDirection: "row", gap: 2 }}>
          <Text style={{ width: 20 }}>Путь к БД:</Text>
          <Input value={dbPath} onChange={setDbPath} />
        </Box>
        <Box style={{ flexDirection: "row", gap: 2 }}>
          <Text style={{ width: 20 }}>Интервал проверки:</Text>
          <Input value={checkInterval} onChange={setCheckInterval} placeholder="часы" />
          <Text style={{ dim: true }}>часов</Text>
        </Box>
      </Box>

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Checkbox checked={proxyEnabled} onChange={setProxyEnabled} label="Включить прокси" />
      </Box>

      <Box style={{ flexDirection: "row", gap: 2 }}>
        <Button onPress={handleSave}>
          <Text style={{ bold: true }}>💾 Сохранить</Text>
        </Button>
        {saved && <Text style={{ color: "green" }}>✓ Сохранено!</Text>}
      </Box>

      <Box style={{ flexDirection: "column", border: "round", borderColor: "whiteBright", padding: 1 }}>
        <Text style={{ color: "whiteBright", bold: true }}>Текущая конфигурация:</Text>
        <Text style={{ dim: true }}>  Браузер: {browserType}</Text>
        <Text style={{ dim: true }}>  Потоков: {maxThreads}</Text>
        <Text style={{ dim: true }}>  Лимит предупреждений: {warnOnGenerate}</Text>
        <Text style={{ dim: true }}>  БД: {dbPath}</Text>
        <Text style={{ dim: true }}>  Прокси: {proxyEnabled ? "вкл" : "выкл"}</Text>
        <Text style={{ dim: true }}>  Интервал проверки: {checkInterval}ч</Text>
      </Box>
    </Box>
  );
}
