<script lang="ts">
  import { JSONEditor, type Content, Mode } from 'svelte-jsoneditor';

  export let showModal = false;
  export let content: Content = { json: {} };
  export let mode: Mode = Mode.text;

  function closeModal() {
    showModal = false;
  }

  function handleSave() {
    showModal = false;
  }
</script>

{#if showModal}
  <div class="modal-overlay">
    <div class="modal response-editor-modal">
      <h2>编辑返回值</h2>
      <div class="editor-container response-editor">
        <JSONEditor bind:content={content} bind:mode={mode}/>
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
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
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

  .modal h2 {
    margin: 0 0 1.5rem 0;
    color: #ffffff;
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
</style>