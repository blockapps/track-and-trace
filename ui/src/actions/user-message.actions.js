export const RESET_USER_MESSAGE = 'RESET_USER_MESSAGE';
export const SET_USER_MESSAGE = 'SET_USER_MESSAGE';

export const resetUserMessage = () => ({
  type: RESET_USER_MESSAGE
});

export const setUserMessage = (message, success = false) => ({
  type: SET_USER_MESSAGE,
  message,
  success
});
