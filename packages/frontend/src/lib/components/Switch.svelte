<script lang="ts">

  let {
    checked,
    size = 'default',
    disabled = false,
    loading = false,
    onChange
  } = $props<{
    checked: boolean;
    size?: 'small' | 'default';
    disabled?: boolean;
    loading?: boolean;
    onChange?: (checked: boolean) => void;
  }>();


  function handleChange() {
    if (disabled || loading) {
      return;
    }
    onChange && onChange(!checked)
  }
</script>

<button
  class="switch-wrapper {size} {checked ? 'checked' : ''} {disabled ? 'disabled' : ''} {loading ? 'loading' : ''}"
  onclick={handleChange}
  disabled={disabled}
  role="switch"
  aria-checked={checked}
>
  <div class="switch">
    {#if loading}
      <span class="loading-icon"></span>
    {/if}
    <span class="handle"></span>
  </div>
  {#if $$slots.default}
    <span class="label">
      <slot />
    </span>
  {/if}
</button>

<style>
  .switch-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    background: none;
    border: none;
    padding: 0;
  }

  .switch-wrapper:focus-visible {
    outline: 2px solid #1890ff;
    outline-offset: 2px;
    border-radius: 2px;
  }

  .switch {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    min-width: 44px;
    height: 22px;
    line-height: 22px;
    border-radius: 100px;
    background-color: rgba(255, 255, 255, 0.3);
    transition: all 0.2s;
  }

  .handle {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #fff;
    transition: all 0.2s;
  }

  /* 选中状态 */
  .checked .switch {
    background-color: #1890ff;
  }

  .checked .handle {
    left: calc(100% - 20px);
  }

  /* 小尺寸 */
  .small .switch {
    min-width: 28px;
    height: 16px;
    line-height: 16px;
  }

  .small .handle {
    width: 12px;
    height: 12px;
  }

  .small.checked .handle {
    left: calc(100% - 14px);
  }

  /* 禁用状态 */
  .disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* 加载状态 */
  .loading .handle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border: 2px solid #1890ff;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  .checked .loading-icon {
    border-color: #fff;
    border-right-color: transparent;
  }

  @keyframes spin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  /* 标签文本 */
  .label {
    line-height: 1;
    font-size: 14px;
    color: #fff;
  }
</style>
