// frontend/src/reducers/clients.js

const initialState = {
  items: [],
  loading: true,
  error: null
};

export default function clientsReducer(state = initialState, action: { type: any; payload: any; }) {
  switch (action.type) {
    case 'FETCH_CLIENTS':
      return {
        ...state,
        items: action.payload,
        loading: false
      };
    case 'ADD_CLIENT':
      return {
        ...state,
        items: [...state.items, action.payload],
        loading: false
      };
    // Other cases for client management (e.g., UPDATE_CLIENT, DELETE_CLIENT) follow a similar pattern.

    default:
      return state;
  }
}
