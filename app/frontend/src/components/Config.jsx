import { useState } from "react";
import configService from "../services/ConfigService";

const ConfigComponent = () => {
  const [config, setConfig] = useState(configService.getConfig());
  const toggleTheme = () => {
    const newTheme = config.theme === "dark" ? "light" : "dark";
    configService.setConfig({ theme: newTheme });
    setConfig(configService.getConfig());
  };
  return (
    <div
      style={{
        background: config.theme === "light" ? "#fff" : "#333",
        color: config.theme === "light" ? "#000" : "#fff",
      }}
    >
      <h1
        style={{
          color: config.theme === "light" ? "#000" : "#fff",
        }}
      >
        Current Theme: {config.theme}
      </h1>
      <button onClick={toggleTheme}>Toggle theme</button>
    </div>
  );
};

export default ConfigComponent;
