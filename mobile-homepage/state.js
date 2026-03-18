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
    return Object.assign({}, defaultState);
  }

  try {
    return Object.assign({}, defaultState, JSON.parse(raw));
  } catch (e) {
    return Object.assign({}, defaultState);
  }
};

export const writeState = (nextState) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, readState(), nextState)));
};

export const clearState = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};
