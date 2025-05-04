<script lang="ts">
  import { type Content } from 'svelte-jsoneditor';
  import { addRuleCollections } from '../api';
  import ResponseEditor from './ResponseEditor.svelte';
  import type { Rule } from './types';
  export let selectedRule: Rule | null = null;

  let showSaveDialog = false;
  let showResponseEditor = false;
  let fileName = '';
  let editingConditionIndex = -1;

  let jsonContent: Content = {
    json: {
      type: 'rule',
      config: {}
    }
  };

  let responseContent: Content = {
    json: {}
  };

  function openSaveDialog() {
    showSaveDialog = true;
    fileName = '';
  }

  function closeSaveDialog() {
    showSaveDialog = false;
  }

  function saveJsonFile() {
    if (!fileName.trim()) return;
    addRuleCollections({
      name: 'lyx'
    })
    closeSaveDialog();
  }

  function openResponseEditor(index: number) {
    editingConditionIndex = index;
    try {
      responseContent = {
        json: conditions[index].response ? JSON.parse(conditions[index].response) : {}
      };
    } catch (e) {
      responseContent = { json: {} };
    }
    showResponseEditor = true;
  }

  $: if (showResponseEditor === false && editingConditionIndex >= 0) {
    conditions[editingConditionIndex].response = JSON.stringify(responseContent.json);
    conditions = [...conditions];
    // 更新 selectedRule 的配置
    if (selectedRule) {
      selectedRule.config = {
        ...selectedRule.config,
        conditions
      };
    }
    editingConditionIndex = -1;
  }

  let requestMethod = 'get';
  let matchType: 'and' | 'or' = 'and';
  let conditions = [{ key: '', value: '', response: '' }];

  $: if (requestMethod || matchType) {
    // 当请求方法或匹配模式改变时，重置匹配条件
    conditions = [{ key: '', value: '', response: '' }];
  }

  function addCondition() {
    conditions = [...conditions, { key: '', value: '', response: '' }];
  }

  function removeCondition(index: number) {
    conditions = conditions.filter((_, i) => i !== index);
  }

  $: if (selectedRule && (requestMethod || matchType || conditions)) {
    selectedRule.config = {
      ...selectedRule.config,
      method: requestMethod,
      matchType: matchType,
      conditions: conditions
    };
  }

  $: if (selectedRule) {
    jsonContent = {
      json: {
        type: 'rule',
        config: selectedRule.config
      }
    };
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
              bind:value={requestMethod}
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
              bind:value={matchType}
            >
              <option value="and">与（&）</option>
              <option value="or">或（|）</option>
            </select>
          </div>
          <div class="conditions-container">
            <label>匹配条件</label>
            {#each conditions as condition, i}
              <div class="condition-row">
                <input
                  type="text"
                  class="form-input condition-input"
                  placeholder="Key"
                  bind:value={condition.key}
                />
                <input
                  type="text"
                  class="form-input condition-input"
                  placeholder="Value"
                  bind:value={condition.value}
                />
                <button
                  class="edit-response-btn"
                  on:click={() => openResponseEditor(i)}
                >
                  编辑返回值
                </button>
                <button
                  class="remove-btn"
                  on:click={() => removeCondition(i)}
                  disabled={conditions.length === 1}
                >
                  删除
                </button>
              </div>
            {/each}
          </div>
        </div>
      </div>


      <ResponseEditor
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
  .save-btn {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
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

  .response-editor-modal {
    width: 80%;
    max-width: 800px;
    height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .response-editor {
    flex: 1;
    margin: 1rem 0;
    min-height: 300px;
  }

  .save-btn:hover {
    background-color: #45a049;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background-color: #2a2a2a;
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
  }

  .modal h2 {
    margin: 0 0 1.5rem 0;
    color: #ffffff;
  }

  .file-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .file-extension {
    color: #888;
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  .cancel-btn,
  .confirm-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .cancel-btn {
    background-color: #666;
    color: white;
  }

  .confirm-btn {
    background-color: #4CAF50;
    color: white;
  }

  .cancel-btn:hover {
    background-color: #555;
  }

  .confirm-btn:hover {
    background-color: #45a049;
  }

  /* @import 'svelte-jsoneditor/themes/jse-theme-dark.css'; */
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

  .divider {
    width: 1px;
    height: 100%;
    margin: 0 10px;
    background-color: #333;
  }

  .detail-section {
    background: #2a2a2a;
    border-radius: 8px;
    overflow: hidden;
  }

  .section-header {
    padding: 1rem;
    border-bottom: 1px solid #333;
  }

  .section-header h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.2rem;
  }

  .section-content {
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center; /* 添加垂直居中对齐 */
  }

  .basic-info {
    flex: 1;
    height: fit-content;
  }

  .json-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .editor-container {
    flex: 1;
    display: flex;
    height: 100%;
  }

  .form-group {
    display: inline-flex;
    align-items: center;
    margin-right: 1rem;
    margin-bottom: 0; /* 移除底部边距 */
    flex: 0 0 auto; /* 修改为不伸缩 */
    min-width: 200px; /* 减小最小宽度 */
  }

  .form-group label {
    min-width: 70px; /* 减小标签宽度 */
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
    min-width: 100px; /* 减小输入框最小宽度 */
  }

  .select-input {
    appearance: none;
    padding: 0.5rem 2rem 0.5rem 0.5rem; /* 调整内边距，右侧留出箭头空间 */
    background-color: #2a2a2a;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    width: 120px; /* 设置固定宽度 */
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

  .condition-row .form-input {
    flex: 1;
    margin-right: 0.5rem;
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
    margin-top: 0; /* 移除顶部边距 */
    padding: 0.5rem;
    background-color: #1890ff;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    width: auto; /* 修改宽度为自动适应内容 */
    height: 38px; /* 设置固定高度与表单控件一致 */
    display: flex;
    align-items: center;
  }

  .add-btn:hover {
    background-color: #40a9ff;
  }

  .form-group label {
    display: block;
    color: #888;
  }

  .form-input {
    width: 100%;
    padding: 0.5rem;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
  }

  .no-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #888;
  }

  .condition-input {
    max-width: 200px;
  }

  .select-input {
    appearance: none;
    padding-right: 2rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8.825L1.175 4 2.238 2.938 6 6.7l3.763-3.763L10.825 4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
  }
</style>