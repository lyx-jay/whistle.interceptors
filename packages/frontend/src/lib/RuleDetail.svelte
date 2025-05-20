<script lang="ts">
  import { Mode, type Content, type JSONContent, type TextContent } from 'svelte-jsoneditor';
  import ResponseEditor from './ResponseEditor.svelte';
  import { ruleStore } from './stores/rules';
  import type { Rule } from './types';
  import Switch from './components/Switch.svelte';
  
  export let selectedRule: Rule | null = null;
  let showResponseEditor = false;
  let editingConditionIndex = -1;
  let responseContent: Content = { text: '' } as TextContent;
  let mode: Mode = Mode.text;

  function openResponseEditor(index: number) {
    editingConditionIndex = index;
    if (mode === Mode.tree) {
      try {
        responseContent = {
          json: selectedRule?.config.conditions[index].response ? JSON.parse(selectedRule.config.conditions[index].response) : {}
        } as JSONContent;
      } catch (e) {
        responseContent = { json: {} } as JSONContent;
      }
    } else {
      responseContent = {
        text: selectedRule?.config.conditions[index].response || ''
      } as TextContent;
    }
    showResponseEditor = true;
  }

  $: if (showResponseEditor === false && editingConditionIndex >= 0 && selectedRule) {
    const config = { ...selectedRule.config };
    // @ts-ignore
    config.conditions[editingConditionIndex].response = mode === Mode.text ? responseContent.text : JSON.stringify(responseContent.json);
    console.log('[info: 27]:', editingConditionIndex, responseContent, config, mode);
    ruleStore.updateRuleConfig(selectedRule.id, config);
    editingConditionIndex = -1;
  }

  function addCondition() {
    if (!selectedRule) return;
    const config = { ...selectedRule.config };
    config.conditions = [...config.conditions, { key: '', value: '', response: '', enabled: true, remark: '' }];
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }

  function removeCondition(index: number) {
    if (!selectedRule) return;
    const config = { ...selectedRule.config };
    config.conditions = config.conditions.filter((_, i) => i !== index);
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }

  function updateMethod(method: string) {
    if (!selectedRule) return;
    const config = { 
      ...selectedRule.config, 
      method: method.toUpperCase() as Rule['config']['method']
    };
    config.conditions = [{ key: '', value: '', response: '' }];
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }

  function updateMatchType(matchType: 'and' | 'or') {
    if (!selectedRule) return;
    const config = { ...selectedRule.config, matchType };
    config.conditions = [{ key: '', value: '', response: '' }];
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }
</script>

<div class="rule-detail">
  {#if selectedRule?.id}
    <div class="detail-layout">
      <div class="detail-section basic-info">
        <div class="section-content">
          <button class="add-btn" on:click={addCondition}>
            添加条件
          </button>
          <div class="form-group">
            <label for="requestMethod">请求方式</label>
            <select
              id="requestMethod"
              class="form-input select-input"
              value={selectedRule.config.method.toLowerCase()}
              on:change={(e) => updateMethod(e.currentTarget.value)}
            >
              <option value="get">GET</option>
              <option value="post">POST</option>
            </select>
          </div>
          <div class="form-group">
            <label for="matchType">匹配模式</label>
            <select
              id="matchType"
              class="form-input select-input"
              value={selectedRule.config.matchType}
              on:change={(e) => updateMatchType(e.currentTarget.value as 'and' | 'or')}
            >
              <option value="and">与（&）</option>
              <option value="or">或（|）</option>
            </select>
          </div>
          <div class="conditions-container">
            <fieldset>
              <legend>匹配条件</legend>
              {#each selectedRule.config.conditions as condition, i}
                <div class="condition-row" role="group" aria-labelledby="conditions-label">
                  <Switch
                    size="small"
                    bind:checked={condition.enabled}
                    on:click={() => {
                      if (selectedRule) {
                        const config = { ...selectedRule.config };
                        ruleStore.updateRuleConfig(selectedRule.id, config);
                      }
                    }}
                  />
                  <div class="condition-inputs">
                    <input
                      type="text"
                      class="form-input condition-input"
                      placeholder="Key"
                      bind:value={condition.key}
                      on:input={() => {
                        if (selectedRule) {
                          const config = { ...selectedRule.config };
                          ruleStore.updateRuleConfig(selectedRule.id, config);
                        }
                      }}
                    />
                    <input
                      type="text"
                      class="form-input condition-input"
                      placeholder="Value"
                      bind:value={condition.value}
                      on:input={() => {
                        if (selectedRule) {
                          const config = { ...selectedRule.config };
                          ruleStore.updateRuleConfig(selectedRule.id, config);
                        }
                      }}
                    />
                    <input
                      type="text"
                      class="form-input remark-input"
                      placeholder="备注"
                      bind:value={condition.remark}
                      on:input={() => {
                        if (selectedRule) {
                          const config = { ...selectedRule.config };
                          ruleStore.updateRuleConfig(selectedRule.id, config);
                        }
                      }}
                    />
                  </div>
                  <div class="condition-actions">
                    <button
                      class="edit-response-btn"
                      on:click={() => openResponseEditor(i)}
                    >
                      编辑返回值
                    </button>
                    <button
                      class="remove-btn"
                      on:click={() => removeCondition(i)}
                      disabled={selectedRule.config.conditions.length === 1}
                    >
                      删除
                    </button>
                  </div>
                </div>
              {/each}
            </fieldset>
          </div>
        </div>
      </div>

      <ResponseEditor
        bind:mode={mode}
        bind:showModal={showResponseEditor}
        bind:content={responseContent}
      />
    </div>
  {:else}
    <div class="no-selection">
      选择一个规则查看详情
    </div>
  {/if}
</div>

<style>
  .rule-detail {
    height: calc(100% - 2rem);
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }

  .detail-layout {
    display: flex;
    height: 100%;
    position: relative;
  }

  .detail-section {
    background: #2a2a2a;
    border-radius: 8px;
    overflow: hidden;
  }

  .section-content {
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .basic-info {
    flex: 1;
    height: fit-content;
  }

  .form-group {
    display: inline-flex;
    align-items: center;
    margin-right: 1rem;
    margin-bottom: 0;
    flex: 0 0 auto;
    min-width: 200px;
  }

  .form-group label {
    min-width: 70px;
    margin-right: 0.5rem;
    color: #888;
    white-space: nowrap;
  }

  .form-input {
    flex: 1;
    padding: 0.5rem;
    background-color: #2a2a2a;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    min-width: 100px;
  }

  .select-input {
    appearance: none;
    padding: 0.5rem 2rem 0.5rem 0.5rem;
    background-color: #2a2a2a;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    width: 120px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8.825L1.175 4 2.238 2.938 6 6.7l3.763-3.763L10.825 4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 12px;
  }

  .select-input:hover {
    border-color: #444;
    background-color: #333;
  }

  .select-input:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  .conditions-container {
    margin-top: 1rem;
    width: 100%;
  }

  .condition-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    align-items: center;
  }

  .condition-inputs {
    display: flex;
    flex: 1;
    gap: 0.5rem;
  }

  .condition-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  .condition-input {
    width: 200px;
  }

  .remark-input {
    flex: 1;
  }

  .remove-btn {
    padding: 0.5rem;
    background-color: #ff4d4f;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
  }

  .remove-btn:hover {
    background-color: #ff7875;
  }

  .remove-btn:disabled {
    background-color: #666;
    cursor: not-allowed;
  }

  .add-btn {
    margin-top: 0;
    padding: 0.5rem;
    background-color: #1890ff;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    width: auto;
    height: 38px;
    display: flex;
    align-items: center;
  }

  .add-btn:hover {
    background-color: #40a9ff;
  }

  .edit-response-btn {
    padding: 0.5rem;
    background-color: #1890ff;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    margin-right: 0.5rem;
  }

  .edit-response-btn:hover {
    background-color: #40a9ff;
  }

  .condition-input {
    max-width: 200px;
  }

  .no-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #888;
  }
</style>