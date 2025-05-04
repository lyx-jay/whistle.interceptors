import { writable } from 'svelte/store';
import type { Rule } from '../types';

type RuleStore = {
  rules: Rule[];
  selectedRule: Rule | null;
  originalRules: Rule[];
};

const createRuleStore = () => {
  const initialState: RuleStore = {
    rules: [
      { id: '1', name: '规则1' },
      { id: '2', name: '规则2' },
      { id: '3', name: '规则3' }
    ],
    selectedRule: null,
    originalRules: []
  };

  const { subscribe, set, update } = writable<RuleStore>(initialState);

  return {
    subscribe,
    addRule: (name: string) => {
      update(store => {
        const newRule = {
          id: String(store.rules.length + 1),
          name: name.trim()
        };
        return {
          ...store,
          rules: [...store.rules, newRule],
          selectedRule: newRule
        };
      });
    },
    deleteRule: (ruleId: string) => {
      update(store => {
        const newRules = store.rules.filter(r => r.id !== ruleId);
        const newSelectedRule = store.selectedRule?.id === ruleId ? null : store.selectedRule;
        return {
          ...store,
          rules: newRules,
          selectedRule: newSelectedRule
        };
      });
    },
    selectRule: (rule: Rule) => {
      update(store => ({
        ...store,
        selectedRule: rule
      }));
    },
    saveRules: () => {
      update(store => ({
        ...store,
        originalRules: [...store.rules]
      }));
      console.log('Rules saved:', initialState);
    },
    filterRules: (query: string) => {
      update(store => ({
        ...store,
        rules: store.rules.filter(rule =>
          rule.name.toLowerCase().includes(query.toLowerCase())
        )
      }));
    },
    reset: () => set(initialState)
  };
};

export const ruleStore = createRuleStore();