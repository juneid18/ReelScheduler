let navigateFn;

export const setNavigator = (navigator) => {
  navigateFn = navigator;
};

export const navigateTo = (path) => {
  if (navigateFn) {
    navigateFn(path);
  } else {
    console.warn("Navigator is not set yet!");
    window.location.href = path; // fallback
  }
};
