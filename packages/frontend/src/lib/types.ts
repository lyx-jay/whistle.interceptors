export type RuleProxyMode = "network" | "mock"

export interface RuleCondition {
  ruleId: string;
  key: string;
  value: string;
  response: string;
  enabled: boolean;
  remark?: string;
  proxyMode: RuleProxyMode;
}
export interface Rule {
  id: string;
  name: string;
  config: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    matchType: "and" | "or";
    conditions: RuleCondition[];
  };
}
