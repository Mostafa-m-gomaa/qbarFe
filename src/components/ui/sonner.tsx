import { Toaster as SonnerToaster } from 'sonner';

/** App toast surface. Mounted once near the root. */
export function Toaster() {
  return (
    <SonnerToaster
      dir="ltr"
      position="top-center"
      theme="system"
      richColors
      closeButton
      visibleToasts={4}
      gap={10}
      offset={20}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            'font-sans rounded-xl border bg-background/95 shadow-xl shadow-black/10 backdrop-blur-md',
          title: 'text-sm font-semibold',
          description: 'text-sm text-muted-foreground',
          success: 'border-emerald-500/30',
          error: 'border-destructive/30',
          loading: 'border-primary/20',
          closeButton:
            'border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        },
      }}
    />
  );
}
