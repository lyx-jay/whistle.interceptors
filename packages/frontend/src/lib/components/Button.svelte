<script lang="ts">
  export let type: 'primary' | 'secondary' | 'danger' = 'primary';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let disabled = false;
  export let loading = false;
  export let block = false;
</script>

<button
  class="btn {type} {size} {block ? 'block' : ''}"
  {disabled}
  on:click
  {...$$restProps}
>
  {#if loading}
    <span class="loading" />
  {/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 尺寸变体 */
  .small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    height: 24px;
    min-width: 24px;
  }

  .medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    height: 32px;
    min-width: 32px;
  }

  .large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
    height: 40px;
    min-width: 40px;
  }

  /* 类型变体 */
  .primary {
    background-color: #1890ff;
    color: white;
  }

  .primary:hover:not(:disabled) {
    background-color: #40a9ff;
  }

  .secondary {
    background-color: #666;
    color: white;
  }

  .secondary:hover:not(:disabled) {
    background-color: #777;
  }

  .danger {
    background-color: #ff4d4f;
    color: white;
  }

  .danger:hover:not(:disabled) {
    background-color: #ff7875;
  }

  /* 块级按钮 */
  .block {
    width: 100%;
    display: flex;
  }

  /* 加载动画 */
  .loading {
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
