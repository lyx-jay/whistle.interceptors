<script lang="ts">
  export let type: 'primary' | 'secondary' | 'danger' = 'primary';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let disabled = false;
  export let loading = false;
  export let block = false;
  export let fontSize: string | undefined = undefined;
</script>

<button
  class="btn {type} {size} {block ? 'block' : ''}"
  style={fontSize ? `font-size: ${fontSize}` : ''}
  {disabled}
  on:click
  {...$$restProps}
>
  {#if loading}
    <span class="loading"></span>
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
    background-color: #ffffff;
    color: #000000;
  }

  .primary:hover:not(:disabled) {
    background-color: #f4f4f5;
  }

  .secondary {
    background-color: #27272a;
    color: #ffffff;
    border: 1px solid #3f3f46;
  }

  .secondary:hover:not(:disabled) {
    background-color: #3f3f46;
  }

  .danger {
    background-color: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.5);
  }

  .danger:hover:not(:disabled) {
    background-color: rgba(239, 68, 68, 0.3);
    border-color: #ef4444;
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
