import { useEffect, useState } from "react";
import { useThrottledCallback } from "use-debounce";
import Locale from "../locales";
import { InputRange } from "./input-range";
import { List, ListItem } from "./ui-lib";

export function UToolsConfigList() {
  const [height, setHeight] = useState(
    utools.dbStorage.getItem("utools-config/plugin-height") || 550,
  );

  const updatePluginHeight = useThrottledCallback((height: number) => {
    utools.setExpendHeight(height);
    utools.dbStorage.setItem("utools-config/plugin-height", height);
  }, 250);

  useEffect(() => {
    updatePluginHeight(height);
  }, [height, updatePluginHeight]);

  return (
    <List>
      <ListItem title={Locale.Settings.UTools.PluginHeight.Title}>
        <InputRange
          value={height}
          min="100"
          max="1000"
          step="1"
          onChange={(e) => {
            setHeight(e.currentTarget.valueAsNumber);
          }}
        ></InputRange>
      </ListItem>
    </List>
  );
}
