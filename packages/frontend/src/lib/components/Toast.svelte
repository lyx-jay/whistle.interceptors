<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  type ToastType = 'info' | 'success' | 'error' | 'warning';
  
  export let type: ToastType = 'info';
  export let message: string = '';
  export let duration: number = 3000;
  export let onClose: () => void = () => {};

  let visible = true;
  let timer: ReturnType<typeof setTimeout>;

  onMount(() => {
    timer = setTimeout(() => {
      visible = false;
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  });
</script>

{#if visible}
  <div
    class="toast {type}"
    role="alert"
    aria-live="polite"
    transition:fly={{ y: -60, duration: 300 }}
  >
    <span class="message">{message}</span>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    left: 50%;
    top: 16px;
    transform: translateX(-50%);
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .info {
    background-color: rgba(24, 144, 255, 0.9);
    border-color: rgba(24, 144, 255, 0.3);
  }

  .success {
    background-color: #effdf3;
    border-color: rgba(82, 196, 26, 0.3);
    color: #52c41a;
  }

  .error {
    background-color: #fef1f1;
    border-color: rgba(255, 77, 79, 0.3);
    color: #ff4d4f;
  }

  .warning {
    background-color: rgba(250, 173, 20, 0.9);
    border-color: rgba(250, 173, 20, 0.3);
  }

  .message {
    margin-left: 4px;
    line-height: 1.5;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
</style>
