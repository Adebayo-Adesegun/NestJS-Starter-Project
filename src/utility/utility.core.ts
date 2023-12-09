const parseBoolean = (value: string | boolean): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
};

export { parseBoolean };
