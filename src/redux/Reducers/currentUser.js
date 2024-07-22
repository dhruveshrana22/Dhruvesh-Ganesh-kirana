import actions from "../actions";

const initialState = {
  currentUserData: [],
};

const currentUser = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_CURRENT_USER_DATA:
      return {
        currentUserData: action.data,
      };
    default:
      return state;
  }
};

export default currentUser;
