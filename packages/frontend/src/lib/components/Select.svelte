<script lang="ts">
  import { onMount } from 'svelte';
  
  export let options: Array<{ value: any; label: string }> = [];
  export let value: any = undefined;
  export let placeholder = '请选择';
  export let disabled = false;
  export let class_ = '';
  
  let isOpen = false;
  let selectElement: HTMLDivElement;
  
  function handleSelect(option: { value: any; label: string }) {
    value = option.value;
    isOpen = false;
    // 直接派发 change 事件
    selectElement?.dispatchEvent(new CustomEvent('change', {
      detail: { value: option.value },
      bubbles: true
    }));
  }
  
  function toggleDropdown() {
    if (!disabled) {
      isOpen = !isOpen;
    }
  }
  
  // 点击外部关闭下拉框
  function handleClickOutside(event: MouseEvent) {
    if (selectElement && !selectElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
  
  $: selectedOption = options.find(opt => opt.value === value);
  $: displayValue = selectedOption ? selectedOption.label : placeholder;
</script>

<div
  class="select-container {class_}"
  class:disabled
  bind:this={selectElement}
>
  <div
    class="select-header"
    on:click={toggleDropdown}
    class:open={isOpen}
  >
    <span class="select-value" class:placeholder={!selectedOption}>
      {displayValue}
    </span>
    <span class="select-arrow" class:open={isOpen}>▼</span>
  </div>
  
  {#if isOpen}
    <div class="select-options">
      {#each options as option}
        <div
          class="select-option"
          class:selected={option.value === value}
          on:click={() => handleSelect(option)}
        >
          {option.label}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .select-container {
    position: relative;
    width: 100%;
    font-size: 14px;
    user-select: none;
  }
  
  .select-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .select-header:hover {
    border-color: #c0c4cc;
  }
  
  .select-header.open {
    border-color: #409eff;
  }
  
  .select-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #2c2b2b;
  }
  
  .select-value.placeholder {
    color: #909399;
  }
  
  .select-arrow {
    margin-left: 8px;
    font-size: 12px;
    color: #c0c4cc;
    transition: transform 0.2s;
  }
  
  .select-arrow.open {
    transform: rotate(180deg);
  }
  
  .select-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    max-height: 200px;
    overflow-y: auto;
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 1000;
    color: #2c2b2b;
  }
  
  .select-option {
    padding: 8px 12px;
    cursor: pointer;
  }
  
  .select-option:hover {
    background-color: #f5f7fa;
  }
  
  .select-option.selected {
    color: #409eff;
    font-weight: 500;
    background-color: #ecf5ff;
  }
  
  .disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .disabled .select-header {
    cursor: not-allowed;
    background-color: #f5f7fa;
  }
  
  .disabled .select-header:hover {
    border-color: #dcdfe6;
  }
</style>
