export type RuleProxyMode = "network" | "mock"

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface RuleCondition {
  ruleId: string;
  pairs: KeyValuePair[];
  response: string;
  enabled: boolean;
  remark?: string;
  proxyMode: RuleProxyMode;
}
export interface Rule {
  id: string;
  name: string;
  config: {
    conditions: RuleCondition[];
  };
}
