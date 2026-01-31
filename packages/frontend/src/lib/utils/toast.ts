import Toast from "@/lib/components/Toast.svelte";
import { mount, unmount } from 'svelte';
type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastOptions {
  message: string;
  duration?: number;
  type?: ToastType;
}

class ToastManager {
  private static instance: ToastManager;
  private container: HTMLDivElement | null = null;
  private currentToast: any = null;
  private currentWrapper: HTMLDivElement | null = null;

  private constructor() {}

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  private getContainer() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private createToast(options: ToastOptions) {
    const container = this.getContainer();

    // 如果当前有正在显示的 toast，先清理掉
    if (this.currentToast) {
      try {
        unmount(this.currentToast);
      } catch (e) {
        console.error('Failed to unmount previous toast', e);
      }
      if (this.currentWrapper) {
        this.currentWrapper.remove();
      }
    }

    const wrapper = document.createElement("div");
    container.appendChild(wrapper);
    this.currentWrapper = wrapper;

    const { message = "", duration = 3000, type = "info" } = options;

    // 确保在创建组件之前所有必需的属性都已定义
    if (!message) {
      console.warn('Toast message is required');
      return;
    }

    const toastComponent = mount(Toast, {
      target: wrapper,
      props: {
        message,
        duration,
        type,
        onClose: () => {
          // 只清理自己，如果自己是当前活跃的那个
          if (this.currentToast === toastComponent) {
            setTimeout(() => {
              if (this.currentToast === toastComponent) {
                unmount(toastComponent);
                wrapper.remove();
                this.currentToast = null;
                this.currentWrapper = null;
                
                if (container.childNodes.length === 0) {
                  container.remove();
                  this.container = null;
                }
              }
            }, 300);
          }
        },
      },
    });

    this.currentToast = toastComponent;
    return toastComponent;
  }

  public show(options: string | ToastOptions) {
    const config = typeof options === "string" ? { message: options } : options;
    return this.createToast(config);
  }

  public success(options: string | Omit<ToastOptions, "type">) {
    const config = typeof options === "string" ? { message: options } : options;
    return this.createToast({ ...config, type: "success" });
  }

  public error(options: string | Omit<ToastOptions, "type">) {
    const config = typeof options === "string" ? { message: options } : options;
    return this.createToast({ ...config, type: "error" });
  }

  public info(options: string | Omit<ToastOptions, "type">) {
    const config = typeof options === "string" ? { message: options } : options;
    return this.createToast({ ...config, type: "info" });
  }

  public warning(options: string | Omit<ToastOptions, "type">) {
    const config = typeof options === "string" ? { message: options } : options;
    return this.createToast({ ...config, type: "warning" });
  }
}

export const toast = ToastManager.getInstance();
