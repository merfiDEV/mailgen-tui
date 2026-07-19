import React from "react";
import { Box, Text } from "@semos-labs/glyph";

interface ProgressBarProps {
  current: number;
  total: number;
  width?: number;
}

export function ProgressBar({ current, total, width = 40 }: ProgressBarProps) {
  const ratio = total > 0 ? current / total : 0;
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  const pct = Math.round(ratio * 100);

  return (
    <Box style={{ flexDirection: "row", gap: 1, paddingX: 1 }}>
      <Text style={{ color: "cyan" }}>{bar}</Text>
      <Text style={{ color: "whiteBright" }}>{` ${pct}% (${current}/${total})`}</Text>
    </Box>
  );
}
