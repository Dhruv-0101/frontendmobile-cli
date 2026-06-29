export const getInitials = (name: string): string => {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
