// frontend/src/reducers/tasks.js

const initialState = {
  items: [],
  loading: true,
  error: null
};

export default function tasksReducer(state = initialState, action: { type: any; payload: any; }) {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        items: [...state.items, action.payload],
        loading: false
      };
    // Other cases for task management (e.g., FETCH_TASKS, UPDATE_TASK, DELETE_TASK) follow a similar pattern.

    default:
      return state;
  }
}
