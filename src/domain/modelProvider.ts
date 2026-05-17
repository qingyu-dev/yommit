export type ModelProvider = 'DeepSeek' | 'Alibaba (China)';

export const DEFAULT_PROVIDER: ModelProvider = 'DeepSeek';

export type ProviderDefaults = {
  label: string;
  model: string;
  baseUrl: string;
  secretKey: string;
};

const PROVIDER_DEFAULTS: Record<ModelProvider, ProviderDefaults> = {
  DeepSeek: {
    label: 'DeepSeek',
    model: 'deepseek-v4-flash',
    baseUrl: 'https://api.deepseek.com',
    secretKey: 'yommit.deepseekApiKey',
  },
  'Alibaba (China)': {
    label: 'Alibaba (China)',
    model: 'qwen3.6-flash',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    secretKey: 'yommit.aliyunApiKey',
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
