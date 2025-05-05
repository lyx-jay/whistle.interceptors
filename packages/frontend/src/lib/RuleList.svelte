<script lang="ts">
  import type { Rule } from './types';
  import { ruleStore } from './stores/rules';

  let showAddDialog = false;
  let newRuleName = '';
  let newRuleId = '';
  let errorMessage = '';
  let searchQuery = '';

  export let selectedRule: Rule | null = null;

  function openAddDialog() {
    showAddDialog = true;
    newRuleName = '';
    newRuleId = '';
    errorMessage = '';
  }

  function closeAddDialog() {
    showAddDialog = false;
    errorMessage = '';
  }

  function addRule() {
    if (!newRuleName.trim()) return;
    try {
      ruleStore.addRule(newRuleName, newRuleId.trim() || undefined);
      closeAddDialog();
    } catch (error) {
      // @ts-ignore
      errorMessage = error.message;
    }
  }

  function saveRules() {
    ruleStore.saveRules();
  }

  function selectRule(rule: Rule) {
    ruleStore.selectRule(rule);
  }

  function deleteRule(rule: Rule) {
    ruleStore.deleteRule(rule.id);
  }

  let rules: Rule[] = [];
  ruleStore.subscribe(state => {
    rules = state.rules;
    selectedRule = state.selectedRule;
  });

  ruleStore.getRulesList()

  $: filteredRules = searchQuery
    ? rules.filter(rule =>
        rule.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rules;
</script>

<div class="rule-container">
  <div class="search-bar">
    <input
      type="text"
      class="search-input"
      placeholder="搜索规则..."
      bind:value={searchQuery}
    />
  </div>
  <div class="rule-content">
    <div class="rule-list">
      {#each filteredRules as rule}
        <div
          class="rule-item {selectedRule?.id === rule.id ? 'selected' : ''}"
          on:click={() => selectRule(rule)}
        >
          <div class="name">{rule.name}</div>
          <div class="id">ID: {rule.id}</div>
          <button class="delete-btn" on:click|stopPropagation={() => deleteRule(rule)}>删除</button>
        </div>
      {/each}
    </div>
  </div>
  <div class="button-bar">
    <button class="action-btn add-btn" on:click={openAddDialog}>添加</button>
    <button class="action-btn save-btn" on:click={saveRules}>保存</button>
  </div>
</div>

{#if showAddDialog}
  <div class="dialog-overlay" on:click={closeAddDialog}>
    <div class="dialog" on:click|stopPropagation>
      <h2>新增规则</h2>
      <input
        type="text"
        class="dialog-input"
        placeholder="请输入规则名称"
        bind:value={newRuleName}
      />
      <input
        type="text"
        class="dialog-input"
        placeholder="请输入规则ID"
        bind:value={newRuleId}
      />
      {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
      {/if}
      <div class="dialog-buttons">
        <button class="dialog-btn cancel-btn" on:click={closeAddDialog}>取消</button>
        <button class="dialog-btn confirm-btn" on:click={addRule}>确定</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .rule-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #1a1a1a;
    color: #ffffff;
    width: 100%
  }

  .search-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border-bottom: 1px solid #333;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #2a2a2a;
    color: #ffffff;
  }

  .rule-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .rule-list {
    width: 100%;
    overflow-y: auto;
  }

  .rule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #333;
    cursor: pointer;
  }

  .rule-item:hover {
    background-color: #2a2a2a;
  }

  .rule-item.selected {
    background-color: #333;
  }

  .name {
    font-weight: bold;
  }

  .id {
    font-size: 0.8rem;
    color: #888;
  }
  .delete-btn {
    margin-left: 1rem;
    padding: 0.2rem 0.6rem;
    background: #ff4d4f;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background 0.2s;
  }
  .delete-btn:hover {
    background: #d9363e;
  }

  .button-bar {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid #333;
  }

  .action-btn {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
  }

  .add-btn {
    background: #1890ff;
  }

  .add-btn:hover {
    background: #40a9ff;
  }

  .save-btn {
    background: #52c41a;
  }

  .save-btn:hover {
    background: #73d13d;
  }

  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .dialog {
    background-color: #2a2a2a;
    padding: 2rem;
    border-radius: 8px;
    min-width: 300px;
  }

  .dialog h2 {
    margin: 0 0 1.5rem 0;
    color: #ffffff;
  }

  .dialog-input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #1a1a1a;
    color: #ffffff;
  }

  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .dialog-btn {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .cancel-btn {
    background: #666;
    color: #fff;
  }

  .cancel-btn:hover {
    background: #888;
  }

  .confirm-btn {
    background: #1890ff;
    color: #fff;
  }

  .confirm-btn:hover {
    background: #40a9ff;
  }

  .error-message {
    color: #ff4d4f;
    padding: 8px;
    margin: 8px 0;
    background-color: rgba(255, 77, 79, 0.1);
    border-radius: 4px;
    font-size: 14px;
    text-align: center;
  }
</style>