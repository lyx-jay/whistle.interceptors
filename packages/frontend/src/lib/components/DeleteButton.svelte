<script lang="ts">
  import deleteIcon from '@/assets/delete.svg';

  let {
    title = "删除",
    disabled = false,
    class: className = "",
    onclick
  } = $props<{
    title?: string;
    disabled?: boolean;
    class?: string;
    onclick?: (event: MouseEvent) => void;
  }>();
</script>

<button 
  class="delete-button {className}" 
  {onclick}
  {title} 
  {disabled}
  type="button"
>
  <img src={deleteIcon} alt={title} class="delete-icon" />
</button>

<style>
  .delete-button {
    padding: 4px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .delete-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .delete-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .delete-icon {
    width: 16px;
    height: 16px;
    filter: invert(100%);
    opacity: 0.4;
    transition: opacity 0.2s;
  }

  .delete-button:hover:not(:disabled) .delete-icon {
    opacity: 1;
  }
</style>
