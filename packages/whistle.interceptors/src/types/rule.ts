export interface KeyValuePair {
  key: string;
  value: string;
  matchMode?: 'fuzzy' | 'exact';
}

export interface Rule {
  id: string;
  name: string;
  config: {
    conditions: {
      ruleId: string;
      pairs: KeyValuePair[];
      response: string;
      enabled?: boolean;
      remark?: string;
      proxyMode?: 'network' | 'mock';
    }[];
  };
}