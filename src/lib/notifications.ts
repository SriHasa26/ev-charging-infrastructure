export const notify = (title: string, message: string, type: 'warning' | 'info' | 'emergency' | 'success' = 'info') => {
  const event = new CustomEvent('app-notify', {
    detail: { title, message, type }
  });
  window.dispatchEvent(event);
};
