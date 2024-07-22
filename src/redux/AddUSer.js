export const SET_FORM_DATA = "SET_FORM_DATA";

export const setFormData = (formData) => ({
  type: SET_FORM_DATA,
  payload: formData,
});

const initialState = {
  user: {},
};

const AddUser = (state = initialState, action) => {
  switch (action.type) {
    case SET_FORM_DATA:
      return {
        ...state,
        formData: action.payload,
      };
    default:
      return state;
  }
};

export default AddUser;
