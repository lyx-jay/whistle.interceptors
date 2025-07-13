<script lang="ts">
  import { JSONEditor, type Content, Mode } from 'svelte-jsoneditor';
  import { onDestroy } from 'svelte';

  export let showModal = false;
  export let content: Content = { json: {} };
  export let mode: Mode = Mode.text;
  export let onSave: () => void;
  export let onClose: () => void;

  function closeModal() {
    onClose?.()
    // dispatchEvent(new CustomEvent('close'));
  }

  function handleSave() {
    // dispatchEvent(new CustomEvent('save', { detail: { content, mode } }));
    onSave?.()
  }

  function handleKeydown(event: KeyboardEvent) {
    // ESC键关闭模态框
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    
    // Ctrl/Cmd + S 保存并关闭
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      handleSave();
      return;
    }
  }

  let keydownListenerAdded = false;

  // 响应式地添加/移除键盘监听器
  $: {
    if (showModal && !keydownListenerAdded) {
      document.addEventListener('keydown', handleKeydown);
      keydownListenerAdded = true;
    } else if (!showModal && keydownListenerAdded) {
      document.removeEventListener('keydown', handleKeydown);
      keydownListenerAdded = false;
    }
  }

  onDestroy(() => {
    // 确保在组件销毁时移除监听器
    if (keydownListenerAdded) {
      document.removeEventListener('keydown', handleKeydown);
      keydownListenerAdded = false;
    }
  });
</script>

{#if showModal}
  <div class="modal-overlay">
    <div class="modal response-editor-modal">
      <div class="editor-container response-editor">
        <JSONEditor 
          bind:content={content} 
          bind:mode={mode}
          askToFormat={true}
          indentation={2}
        />
      </div>
      <div class="modal-actions">
        <button class="cancel-btn" on:click={closeModal}>取消</button>
        <button class="confirm-btn" on:click={handleSave}>保存</button>
      </div>
    </div>
  </div>
{/if}

<style>
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
    padding: 0.5rem 1.5rem 1.5rem 1.5rem;
    border-radius: 8px;
    width: 400px;
  }

  .response-editor-modal {
    width: 80%;
    max-width: 800px;
    height: 85vh;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .response-editor {
    flex: 1;
    margin: 1rem 0;
    min-height: 400px;
    overflow: hidden;
  }

  .modal h2 {
    margin: 0 0 1.5rem 0;
    color: #ffffff;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    flex-shrink: 0;
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
</style>