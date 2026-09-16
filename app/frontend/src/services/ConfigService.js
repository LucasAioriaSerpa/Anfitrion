class ConfigService {
  constructor() {
    if (ConfigService.instance) {
      return ConfigService.instance;
    }
    this.config = {
      theme: "dark",
      language: "pt-br",
    };
    ConfigService.instance = this;
    return this;
  }

  getConfig() {
    return this.config;
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

const configService = new ConfigService();
export default configService;
