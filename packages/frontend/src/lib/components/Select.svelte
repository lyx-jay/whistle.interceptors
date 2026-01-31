<script lang="ts">
  import { onMount } from "svelte";
  import type { RuleProxyMode } from "../types";
  import arrowDown from "@/assets/arrow-down.svg";

  let {
    options,
    value,
    placeholder = "请选择",
    class_ = "",
    size = "default",
    onSelect,
  } = $props<{
    options: Array<{ value: RuleProxyMode; label: string }>;
    value: any;
    placeholder: string;
    class_: string;
    size?: "small" | "default";
    onSelect: (option: { value: RuleProxyMode; label: string }) => void;
  }>();

  let isOpen = $state(false);
  let selectElement: HTMLDivElement;

  function handleSelect(option: { value: string; label: string }) {
    value = option.value;
    isOpen = false;
    onSelect && onSelect(option);
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  // 点击外部关闭下拉框
  function handleClickOutside(event: MouseEvent) {
    if (selectElement && !selectElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
  // @ts-ignore
  let selectedOption = $derived(options.find((opt) => opt.value === value));
  let displayValue = $derived(
    selectedOption ? selectedOption.label : placeholder,
  );
</script>

<div class="select-container {class_} {size}" bind:this={selectElement}>
  <div class="select-header" on:click={toggleDropdown} class:open={isOpen}>
    <span class="select-value" class:placeholder={!selectedOption}>
      {displayValue}
    </span>
    <span class="select-arrow" class:open={isOpen}>
      <img src={arrowDown} alt="arrow" />
    </span>
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
    padding: 0 12px;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    background-color: #18181b;
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
    height: 32px;
    box-sizing: border-box;
  }

  .select-header:hover {
    border-color: #52525b;
  }

  .select-header.open {
    border-color: #ffffff;
    box-shadow: 0 0 0 1px #ffffff;
  }

  .select-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9rem;
  }

  .select-value.placeholder {
    color: #71717a;
  }

  .select-arrow {
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }

  .select-arrow img {
    width: 12px;
    height: 12px;
    opacity: 0.6;
    filter: invert(100%);
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
    background-color: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    padding: 4px;
  }

  .select-option {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-radius: 4px;
    color: #e4e4e7;
    font-size: 0.9rem;
    margin-bottom: 2px;
  }

  .select-option:last-child {
    margin-bottom: 0;
  }

  .select-option:hover {
    background-color: #27272a;
    color: #ffffff;
  }

  .select-option.selected {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-weight: 500;
  }

  .small .select-header {
    height: 28px;
    padding: 0 8px;
  }

  .small .select-value {
    font-size: 0.85rem;
  }

  .small .select-option {
    padding: 6px 10px;
    font-size: 0.85rem;
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
