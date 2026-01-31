<script lang="ts">
  import type { Rule } from '@/lib/types';
  import { ruleStore } from '@/lib/stores/rules';
  import DeleteButton from '@/lib/components/DeleteButton.svelte';
  import Button from '@/lib/components/Button.svelte';

  let showAddDialog = false;
  let newRuleName = '';
  let newRuleId = '';
  let errorMessage = '';
  let searchQuery = '';

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
  let selectedRule: Rule | null = null;
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
          <div class="rule-info">
            <div class="name">{rule.name}</div>
            <div class="id">ID: {rule.id}</div>
          </div>
          <DeleteButton 
            onclick={(e: MouseEvent) => { e.stopPropagation(); deleteRule(rule); }}
            class="item-delete-btn"
          />
        </div>
      {/each}
    </div>
  </div>
  <div class="button-bar">
    <Button type="primary" onclick={openAddDialog}>添加</Button>
    <Button type="secondary" onclick={saveRules}>保存</Button>
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
        <Button type="secondary" onclick={closeAddDialog}>取消</Button>
        <Button type="primary" onclick={addRule}>确定</Button>
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

  .rule-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    overflow: hidden;
  }

  .name {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .id {
    font-size: 0.8rem;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :global(.item-delete-btn) {
    margin-left: 1rem;
  }

  .button-bar {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid #333;
    gap: 1rem;
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