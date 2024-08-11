import * as React from 'react';
import { Token } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';

interface Task {
  _id: string;
  to: string;
  from: string;
  client: string;
  title: string;
  description: string;
  status: 'To do' | 'Pending' | 'Completed';
  dueDate: string;
  files?: Array<{ filename: string; path: string; mimetype: string; size: number; uploadDate: string }>;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  clientId: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onClose, onAddTask, clientId }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [newTask, setNewTask] = React.useState<Omit<Task, '_id' | 'from'>>({
    to: '',
    client: clientId,
    title: '',
    description: '',
    status: 'To do',
    dueDate: '',
  });
  const [files, setFiles] = React.useState<File[]>([]);

  // Create an Axios instance with default headers
  const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:5500/api', // Adjust this if your API has a different base URL
    headers: {
      'x-auth-token': `${localStorage.getItem('custom-auth-token')}`,
    },
  });

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get<Employee[]>('/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to load employees. Please try again.');
      }
    };

    fetchEmployees();
  }, []);

  const handleAddTask = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(newTask).forEach(([key, value]) => {
        formData.append(key, value);
      });
      console.log(files);
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axiosInstance.post<Task>('/tasks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Task added successfully:', response.data);
      onAddTask(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
      }
      setError('An error occurred while adding the task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Add Task
        </Typography>
        <Stack spacing={2} mt={2}>
          <TextField
            label="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            fullWidth
          />
          <TextField
            label="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <FormControl fullWidth>
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={newTask.to}
              label="Assigned To"
              onChange={(e) => setNewTask({ ...newTask, to: e.target.value })}
            >
              <MenuItem value="self">Self Assign</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {`${employee.firstName} ${employee.lastName} (${employee.role})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newTask.status}
              label="Status"
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
            >
              <MenuItem value="To do">To do</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Input type="file" inputProps={{ multiple: true }} onChange={handleFileChange} />
          <Button variant="contained" onClick={handleAddTask} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Task'}
          </Button>
        </Stack>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default AddTaskModal;
