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
  import { toast } from "@/lib/utils/toast";
  import DeleteButton from "@/lib/components/DeleteButton.svelte";
  import Button from "@/lib/components/Button.svelte";

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
            toast.success("数据更新成功");
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
          <Button onclick={addCondition}> 添加条件 </Button>


          <div class="conditions-container">
            <fieldset>
              <legend>匹配条件</legend>
              {#each conditions as condition, i}
                <div
                  class="condition-row"
                  role="group"
                  aria-labelledby="conditions-label"
                >
                  <div style="margin-top: 6px;">
                    <Switch
                      size="small"
                      checked={condition.enabled}
                      onChange={(status: boolean) =>
                        handleSwitchChange({ index: i, status, condition })}
                    />
                  </div>
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
                          <Button
                            type="danger"
                            size="small"
                            onclick={() => removeKeyValuePair(i, pairIndex)}
                            disabled={condition.pairs.length === 1}
                          >
                            -
                          </Button>
                        </div>
                      {/each}
                      <Button
                        size="small"
                        onclick={() => addKeyValuePair(i)}
                        fontSize="12px"
                        class="add-pair-btn"
                      >
                        + Add Pair
                      </Button>
                    </div>
                    <textarea
                      class="form-input remark-input"
                      placeholder="备注"
                      bind:value={condition.remark}
                      oninput={() => {
                        if (selectedRule) {
                          const config = { ...selectedRule.config };
                          ruleStore.updateRuleConfig(selectedRule.id, config);
                        }
                      }}
                    ></textarea>
                  </div>
                  <div class="condition-actions">
                    <Select
                      options={[
                        { value: "network", label: "Live" },
                        { value: "mock", label: "Mock" },
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
                    <Button
                    fontSize="14px"
                      onclick={() => openResponseEditor(i)}
                    >
                      {condition.proxyMode === PROXY_MODE.NETWORK
                        ? "View"
                        : "Edit"}
                    </Button>
                    <DeleteButton
                      onclick={() => removeCondition(i)}
                      title="删除"
                    />
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

  .form-input {
    padding: 0.5rem;
    background-color: #2a2a2a;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    min-width: 100px;
  }

  .conditions-container {
    margin-top: 1rem;
    width: 100%;
  }

  fieldset {
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1.5rem;
  }

  legend {
    color: #888;
    padding: 0 0.5rem;
    font-size: 0.9rem;
  }

  .condition-row {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 0;
    align-items: flex-start;
    border-bottom: 1px solid #333;
  }

  .condition-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .condition-row:first-child {
    padding-top: 0;
  }

  :global(.add-pair-btn) {
    width: 100%;
    margin-top: 0.25rem;
  }

  .condition-inputs {
    display: flex;
    flex: 1;
    gap: 0.5rem;
  }

  .condition-actions {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-left: auto;
    margin-top: 4px;
  }
  .remark-input {
    width: 200px;
    height: 72px;
    resize: none;
    border-color: gray;
  }

  .condition-input {
    width: 200px;
    border-color: gray;
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

  .no-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #888;
  }
</style>
