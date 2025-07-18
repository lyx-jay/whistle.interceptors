<script lang="ts">
  import {
    Mode,
    type Content,
    type JSONContent,
    type TextContent,
  } from "svelte-jsoneditor";
  import ResponseEditor from "@/lib/ResponseEditor.svelte";
  import { ruleStore } from "@/lib/stores/rules";
  import type { Rule, RuleCondition, RuleProxyMode } from "@/lib/types";
  import Switch from "@/lib/components/Switch.svelte";
  import Select from "@/lib/components/Select.svelte";
  import { LOCAL_PREFIX, PROXY_MODE } from "./context";
  import { notifyMessage } from "@/api";
  import { listenPageVisibility } from "./utils";

  let isFirst = true;

  let showResponseEditor = $state(false);
  let editingConditionIndex = $state(-1);
  let responseContent = $state<TextContent | JSONContent>({ text: "" });
  let mode = $state<Mode>(Mode.text);

  let selectedRule = $state<Rule | null>(null);

  let conditions = $state<RuleCondition[]>([]);

  ruleStore.subscribe((state) => {
    selectedRule = state.selectedRule;
    conditions = state.selectedRule?.config.conditions || [];
  });

  function openResponseEditor(index: number) {
    editingConditionIndex = index;
    if (mode === Mode.tree) {
      try {
        responseContent = {
          json: selectedRule?.config.conditions[index].response
            ? JSON.parse(selectedRule.config.conditions[index].response)
            : {},
        } as JSONContent;
      } catch (e) {
        responseContent = { json: {} } as JSONContent;
      }
    } else {
      responseContent = {
        text: selectedRule?.config.conditions[index].response || "",
      } as TextContent;
    }
    showResponseEditor = true;
  }

  function addCondition() {
    if (!selectedRule) return;
    const config = { ...selectedRule.config };
    config.conditions = [
      ...config.conditions,
      {
        pairs: [{ key: "", value: "" }],
        response: "",
        enabled: true,
        remark: "",
        ruleId: selectedRule.id,
        proxyMode: PROXY_MODE.NETWORK,
      },
    ];
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }

  function removeCondition(index: number) {
    if (!selectedRule) return;
    const config = { ...selectedRule.config };
    config.conditions = config.conditions.filter((_, i) => i !== index);
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }





  function handleResponseEditorSave() {
    console.log("[info: 127]:", "保存编辑器并关闭");
    if (editingConditionIndex >= 0 && selectedRule) {
      const config = { ...selectedRule.config };
      // @ts-ignore
      config.conditions[editingConditionIndex].response =
        mode === Mode.text
          // @ts-ignore
          ? responseContent.text
          // @ts-ignore
          : JSON.stringify(responseContent.json);
      ruleStore.updateRuleConfig(selectedRule.id, config);
      editingConditionIndex = -1;
    }
    showResponseEditor = false;
  }

  function handleNotify() {
    selectedRule?.config.conditions.forEach((condition, index) => {
      console.log("condition", condition);
      if (condition.proxyMode === PROXY_MODE.NETWORK && condition.enabled) {
        // 生成condition的唯一标识符
        const conditionId = `${condition.ruleId}_${index}`;
        console.log(
          "发出 sse 请求",
          `${LOCAL_PREFIX}_${conditionId}`,
        );
        notifyMessage({
          storage_prefix: `${LOCAL_PREFIX}_${conditionId}`,
        }).then((res) => {
          if (res) {
            const newCondition = {...condition, response: res, proxyMode: PROXY_MODE.MOCK}
            // 触发store更新以刷新UI
            ruleStore.updateRuleConfigCondition({
              ruleId: selectedRule!.id,
              conditionIndex: index,
              condition: newCondition,
            });
          } else {
            condition.response = "";
          }
        });
      }
    });
  }

  function handleSwitchChange({
    index,
    status,
    condition,
  }: {
    index: number;
    status: boolean;
    condition: RuleCondition;
  }) {
    const newCondition = { ...condition, enabled: status };
    ruleStore.updateRuleConfigCondition({
      ruleId: selectedRule!.id,
      conditionIndex: index,
      condition: newCondition,
    });
    console.log("Switch changed", status);
  }

  function handleSelectDropDown({
    index,
    selectOption,
    condition,
  }: {
    index: number;
    selectOption: { value: RuleProxyMode; label: string };
    condition: RuleCondition;
  }) {
    const newCondition = { ...condition, proxyMode: selectOption.value };
    ruleStore.updateRuleConfigCondition({
      ruleId: selectedRule!.id,
      conditionIndex: index,
      condition: newCondition,
    });
  }

  function addKeyValuePair(conditionIndex: number) {
    if (!selectedRule) return;
    const config = { ...selectedRule.config };
    config.conditions[conditionIndex].pairs.push({ key: "", value: "" });
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }

  function removeKeyValuePair(conditionIndex: number, pairIndex: number) {
    if (!selectedRule) return;
    const config = { ...selectedRule.config };
    config.conditions[conditionIndex].pairs.splice(pairIndex, 1);
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }

  function updateKeyValuePair(conditionIndex: number, pairIndex: number, key: string, value: string) {
    if (!selectedRule) return;
    const config = { ...selectedRule.config };
    config.conditions[conditionIndex].pairs[pairIndex] = { key, value };
    ruleStore.updateRuleConfig(selectedRule.id, config);
  }

  $effect(() => {
    if (selectedRule && isFirst) {
      handleNotify();
      isFirst = false;
    }
  });

  listenPageVisibility(handleNotify);

  // 监听sse
</script>

<div class="rule-detail">
  {#if selectedRule?.id}
    <div class="detail-layout">
      <div class="detail-section basic-info">
        <div class="section-content">
          <button class="add-btn" onclick={addCondition}> 添加条件 </button>


          <div class="conditions-container">
            <fieldset>
              <legend>匹配条件</legend>
              {#each conditions as condition, i}
                <div
                  class="condition-row"
                  role="group"
                  aria-labelledby="conditions-label"
                >
                  <Switch
                    size="small"
                    checked={condition.enabled}
                    onChange={(status: boolean) =>
                      handleSwitchChange({ index: i, status, condition })}
                  />
                  <div class="condition-inputs">
                    <div class="key-value-pairs">
                      {#each condition.pairs as pair, pairIndex}
                        <div class="key-value-pair">
                          <input
                            type="text"
                            class="form-input condition-input"
                            placeholder="Key"
                            bind:value={pair.key}
                            oninput={() => {
                              updateKeyValuePair(i, pairIndex, pair.key, pair.value);
                            }}
                          />
                          <input
                            type="text"
                            class="form-input condition-input"
                            placeholder="Value"
                            bind:value={pair.value}
                            oninput={() => {
                              updateKeyValuePair(i, pairIndex, pair.key, pair.value);
                            }}
                          />
                          <button
                            class="remove-pair-btn"
                            onclick={() => removeKeyValuePair(i, pairIndex)}
                            disabled={condition.pairs.length === 1}
                          >
                            -
                          </button>
                        </div>
                      {/each}
                      <button
                        class="add-pair-btn"
                        onclick={() => addKeyValuePair(i)}
                      >
                        + 添加键值对
                      </button>
                    </div>
                    <input
                      type="text"
                      class="form-input remark-input"
                      placeholder="备注"
                      bind:value={condition.remark}
                      oninput={() => {
                        if (selectedRule) {
                          const config = { ...selectedRule.config };
                          ruleStore.updateRuleConfig(selectedRule.id, config);
                        }
                      }}
                    />
                  </div>
                  <div class="condition-actions">
                    <Select
                      options={[
                        { value: "network", label: "网络模式" },
                        { value: "mock", label: "mock模式" },
                      ]}
                      value={condition.proxyMode}
                      class_="mode-select"
                      onSelect={(selectOption) =>
                        handleSelectDropDown({
                          index: i,
                          selectOption,
                          condition,
                        })}
                      placeholder="选择模式"
                    />
                    <button
                      class="edit-response-btn"
                      onclick={() => openResponseEditor(i)}
                    >
                      {condition.proxyMode === PROXY_MODE.NETWORK
                        ? "查看返回值"
                        : "编辑返回值"}
                    </button>
                    <button
                      class="remove-btn"
                      onclick={() => removeCondition(i)}
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
        bind:mode
        bind:showModal={showResponseEditor}
        bind:content={responseContent}
        onClose={() => (showResponseEditor = false)}
        onSave={handleResponseEditorSave}
      />
    </div>
  {:else}
    <div class="no-selection">选择一个规则查看详情</div>
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
  .remark-input,
  .condition-input {
    width: 200px;
    border-color: gray;
  }

  .remove-btn {
    flex-shrink: 0;
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
    flex-shrink: 0;
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

  .key-value-pairs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-right: 1rem;
  }

  .key-value-pair {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .add-pair-btn {
    padding: 0.25rem 0.5rem;
    background-color: #52c41a;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    align-self: flex-start;
  }

  .add-pair-btn:hover {
    background-color: #73d13d;
  }

  .remove-pair-btn {
    padding: 0.25rem 0.5rem;
    background-color: #ff4d4f;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    min-width: 30px;
  }

  .remove-pair-btn:hover {
    background-color: #ff7875;
  }

  .remove-pair-btn:disabled {
    background-color: #666;
    cursor: not-allowed;
  }

  .no-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #888;
  }
</style>
