export type ModelProvider = 'DeepSeek' | 'Alibaba (China)';

export const DEFAULT_PROVIDER: ModelProvider = 'DeepSeek';

export type ProviderModel = {
  id: string;
  label: string;
  description: string;
};

export type ProviderDefaults = {
  label: string;
  model: string;
  baseUrl: string;
  secretKey: string;
  models: ProviderModel[];
};

const PROVIDER_DEFAULTS: Record<ModelProvider, ProviderDefaults> = {
  DeepSeek: {
    label: 'DeepSeek',
    model: 'deepseek-v4-flash',
    baseUrl: 'https://api.deepseek.com',
    secretKey: 'yommit.deepseekApiKey',
    models: [
      {
        id: 'deepseek-v4-flash',
        label: 'deepseek-v4-flash',
        description: 'Default. Fast and low-cost for everyday commit messages.',
      },
      {
        id: 'deepseek-v4-pro',
        label: 'deepseek-v4-pro',
        description: 'Higher capability model for harder diffs and stricter summaries.',
      },
    ],
  },
  'Alibaba (China)': {
    label: 'Alibaba (China)',
    model: 'qwen3.6-flash',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    secretKey: 'yommit.aliyunApiKey',
    models: [
      {
        id: 'qwen3.6-flash',
        label: 'qwen3.6-flash',
        description: 'Default. Fast and cost-effective Qwen option.',
      },
      {
        id: 'qwen3.6-plus',
        label: 'qwen3.6-plus',
        description: 'Balanced capability, latency, and cost.',
      },
      {
        id: 'qwen3-max',
        label: 'qwen3-max',
        description: 'Most capable Qwen option for more complex changes.',
      },
    ],
  },
};

export function toModelProvider(value: string | undefined): ModelProvider {
  if (value === 'Alibaba (China)') {
    return 'Alibaba (China)';
  }

  return DEFAULT_PROVIDER;
}

export function getProviderDefaults(provider: ModelProvider): ProviderDefaults {
  return PROVIDER_DEFAULTS[provider];
}

export function isProviderModel(provider: ModelProvider, model: string): boolean {
  return PROVIDER_DEFAULTS[provider].models.some((item) => item.id === model);
}
