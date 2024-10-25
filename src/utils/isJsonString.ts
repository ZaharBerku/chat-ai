const isJsonString = (str: string | null) => {
  if (!str) {
    return false;
  }
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export { isJsonString };
