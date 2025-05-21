import { writable, get } from 'svelte/store';
import type { Rule } from '@/lib/types';
import { addRuleCollections, getRuleCollections } from '@/api';
import { toast } from '../utils/toast';

type RuleStore = {
  rules: Rule[];
  selectedRule: Rule | null;
  originalRules: Rule[];
};

const validateNewId = (id: string, rules: Rule[]) => {
  return !rules.some(rule => rule.id === id);
};

const createRuleStore = () => {
  const initialState: RuleStore = {
    rules: [],
    selectedRule: null,
    originalRules: []
  };

  const store = writable<RuleStore>(initialState);
  const { subscribe, set, update } = store;

  return {
    subscribe,
    addRule: (name: string, customId?: string) => {
      update(store => {
        const currentRules = store.rules || [];
        if (customId && !validateNewId(customId, currentRules)) {
          throw new Error('规则ID已存在，请使用其他ID');
        }
        const newRule: Rule = {
          id: customId || String(currentRules.length + 1),
          name: name.trim(),
          config: {
            method: 'GET',
            matchType: 'and',
            conditions: [],
          }
        };
        return {
          ...store,
          rules: [...currentRules, newRule],
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
    updateRuleConfig: (ruleId: string, config: Rule['config']) => {
      update(store => {
        const rules = store.rules.map(rule => {
          if (rule.id === ruleId) {
            return { ...rule, config };
          }
          return rule;
        });
        // console.log('[info: 68]:', { rules })
        const selectedRule = store.selectedRule?.id === ruleId 
          ? { ...store.selectedRule, config }
          : store.selectedRule;
        // console.log('[info: 68]:', {
        //   ...store,
        //   rules,
        //   selectedRule
        // })
        return {
          ...store,
          rules,
          selectedRule
        };
      });
    },
    saveRules: async () => {
      // toast.error('保存成功');
      const currentStore = get(store);
      // console.log('Current rules:', currentStore.rules);

      try {
        await addRuleCollections(currentStore.rules);
        update(store => ({
          ...store,
          originalRules: [...store.rules]
        }));
        toast.success('保存成功');
        console.log('Rules saved successfully');
      } catch (error) {
        toast.error('保存失败');
        console.error('Failed to save rules:', error);
      }
    },
    filterRules: (query: string) => {
      const currentStore = get(store);
      update(store => ({
        ...store,
        rules: currentStore.rules.filter(rule =>
          rule.name.toLowerCase().includes(query.toLowerCase())
        )
      }));
    },
    getCurrentRules: () => {
      return get(store).rules;
    },
    getRulesList: async () => {
      const rulesList = await getRuleCollections()
      // console.log('[info: 110]:', { rulesList })
      update(store => ({
        ...store,
        rules: rulesList.data
      }));
    },
    reset: () => set(initialState)
  };
};

export const ruleStore = createRuleStore();