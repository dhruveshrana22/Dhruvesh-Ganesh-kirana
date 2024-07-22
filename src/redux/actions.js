const actions = {
  SET_CURRENT_USER_DATA: "SET_CURRENT_USER_DATA",

  setCurrentUserData: (data) => ({
    type: actions.SET_CURRENT_USER_DATA,
    data,
  }),
};

export default actions;
