export interface Rule {
  id: string;
  name: string;
  config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    matchType: 'and' | 'or';
    conditions: {
      key: string;
      value: string;
      response: string;
      enabled?: boolean;
      remark?: string;
    }[];
  };
}

