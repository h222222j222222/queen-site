const STORAGE_KEY = "queen-mind-state";

const defaultState = {
  categoryId: "",
  slot: "",
  resultId: "",
  image: "",
};

export const readState = () => {
  const raw = sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return { ...defaultState };
  }

  try {
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultState };
  }
};

export const writeState = (nextState) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readState(), ...nextState }));
};

export const clearState = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};
