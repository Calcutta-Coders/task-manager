'use client';

import * as React from 'react';
import { redirect, useRouter } from 'next/navigation';
import { API_URL } from '@/constants';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Card from '@mui/material/Card';
import { red } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';

export interface Task {
  _id: string;
  to: { firstName: string; lastName: string };
  from: { firstName: string; lastName: string };
  client: { name: string };
  title: string;
  description: string;
  status: 'To do' | 'Pending' | 'Completed';
  dueDate: string;
  attachments?: Array<{ filename: string; path: string; mimetype: string; size: number; uploadDate: string }>;
}

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
});

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedTask: Partial<Task>) => void;
  task: Task | null;
  onFileUpload: (files: File[]) => void;
}
interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onFileDownload: (file: { filename: string; path: string }) => void;
}

function TaskDetailsModal({ open, onClose, task, onFileDownload }: TaskDetailsModalProps) {
  if (!task) return null;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'To do':
        return 'error';
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          {task.title}
        </Typography>
        <Chip label={task.status} color={getStatusColor(task.status)} sx={{ mb: 2 }} />
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              <strong>Assigned To:</strong>
            </Typography>
            <Typography>{`${task.to.firstName} ${task.to.lastName}`}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              <strong>Assigned By:</strong>
            </Typography>
            <Typography>{`${task.from.firstName} ${task.from.lastName}`}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              <strong>Due Date:</strong>
            </Typography>
            <Typography>{new Date(task.dueDate).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              <strong>Client:</strong>
            </Typography>
            <Typography>{task.client.name}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">
          <strong>Description:</strong>
        </Typography>
        <Typography paragraph>{task.description}</Typography>
        {task.attachments && task.attachments.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">
              <strong>Attachments:</strong>
            </Typography>
            <Box sx={{ mt: 1 }}>
              {task.attachments.map((file, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => onFileDownload(file)}
                  sx={{ mr: 1, mb: 1 }}
                >
                  {file.filename}
                </Button>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
}

function EditTaskModal({ open, onClose, onSave, task, onFileUpload }: EditTaskModalProps) {
  const [editedTask, setEditedTask] = React.useState<Partial<Task>>({});
  const router = useRouter();
  React.useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFileUpload(Array.from(event.target.files));
    }
  };

  if (!task) return null;

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
          Edit Task
        </Typography>
        <TextField
          label="Title"
          value={editedTask.title || ''}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          value={editedTask.description || ''}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            value={editedTask.status || ''}
            onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task['status'] })}
          >
            <MenuItem value="To do">To do</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Due Date"
          type="date"
          value={editedTask.dueDate ? editedTask.dueDate.split('T')[0] : ''}
          onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Input type="file" inputProps={{ multiple: true }} onChange={handleFileUpload} />
        <Button onClick={handleSave} variant="contained" sx={{ mt: 2 }}>
          Save Changes
        </Button>
      </Box>
    </Modal>
  );
}

export function AssignedCustomerTasksTable({ clientId }: any): React.JSX.Element {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [taskDetailsModalOpen, setTaskDetailsModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailsModalOpen(true);
  };

  React.useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching tasks for client:', clientId);
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await axiosInstance.get<Task[]>(`/tasks/from/${clientId}`, {
          headers: {
            'x-auth-token': token,
          },
        });

        console.log('Fetched tasks:', response.data);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to fetch tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [clientId]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, taskId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleMenuAction = async (action: string) => {
    if (selectedTaskId) {
      try {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const headers = { 'x-auth-token': token };

        let updatedTask;
        switch (action) {
          case 'edit':
            const taskToEdit = tasks.find((task) => task._id === selectedTaskId);
            if (taskToEdit) {
              setTaskToEdit(taskToEdit);
              setEditModalOpen(true);
            }
            break;
          case 'delete':
            await axiosInstance.delete(`/tasks/${selectedTaskId}`, { headers });
            setTasks(tasks.filter((task) => task._id !== selectedTaskId));
            break;
          case 'complete':
            updatedTask = await axiosInstance.put(
              `/tasks/${selectedTaskId}/status`,
              { status: 'Completed' },
              { headers }
            );
            updateTaskInState(updatedTask.data);
            break;
          case 'pending':
            updatedTask = await axiosInstance.put(
              `/tasks/${selectedTaskId}/status`,
              { status: 'Pending' },
              { headers }
            );
            updateTaskInState(updatedTask.data);
            break;
        }
      } catch (error) {
        console.error('Error updating task:', error);
        setError('Failed to update task. Please try again.');
      }
    }
    handleMenuClose();
  };
  const handleFileDownload = async (file: { filename: string; path: string }) => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axiosInstance.get(`/tasks/download/${file.filename}`, {
        responseType: 'blob',
        headers: {
          'x-auth-token': token,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      // You might want to show an error message to the user here
    }
  };
  const handleSaveEditedTask = async (updatedTask: Partial<Task>) => {
    try {
      console.log(updatedTask);
      const formData = new FormData();
      Object.entries(updatedTask).forEach(([key, value]: any) => {
        formData.append(key, value);
      });
      console.log(files);
      files.forEach((file) => {
        formData.append('files', file);
      });
      console.log('Form Data', formData);
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        throw new Error('No auth token found');
      }
      console.log('part 1');
      // Update the task on the server
      const response = await axiosInstance.put(`/tasks/${updatedTask._id}`, formData, {
        headers: {
          'x-auth-token': token,
        },
      });
      console.log('part 2');
      // Update the task in the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === updatedTask._id ? { ...task, ...response.data } : task))
      );
      setEditModalOpen(false);
      console.log('here');
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleFileUpload = async (event: any) => {
    setFiles(Array.from(event.target.files));
  };

  const updateTaskInState = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
  };

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = React.useMemo(() => {
    let sortableTasks = [...tasks];
    if (sortConfig !== null) {
      sortableTasks.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTasks;
  }, [tasks, sortConfig]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'To do':
        return 'red';
      case 'Completed':
        return 'green';
      case 'Pending':
        return 'orange';
      default:
        return 'inherit';
    }
  };

  const isDateWithin5Days = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const differenceInTime = date.getTime() - now.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays <= 5 && differenceInDays >= 0;
  };

  if (loading) {
    return <Typography>Loading tasks...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell onClick={() => handleSort('to')} style={{ cursor: 'pointer' }}>
              Assigned To{' '}
              {sortConfig?.key === 'to' &&
                (sortConfig.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell>Assigned By</TableCell>
            <TableCell>Task Title</TableCell>
            <TableCell>Task Description</TableCell>
            <TableCell onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer' }}>
              Due Date{' '}
              {sortConfig?.key === 'dueDate' &&
                (sortConfig.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
              Status{' '}
              {sortConfig?.key === 'status' &&
                (sortConfig.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell>Files</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTasks.map((task) => (
            <TableRow key={task._id} onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
              <TableCell>{`${task.to.firstName} ${task.to.lastName}`}</TableCell>
              <TableCell>{`${task.from.firstName} ${task.from.lastName}`}</TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.description}</TableCell>
              <TableCell>
                <Typography style={{ color: isDateWithin5Days(task.dueDate) ? 'red' : 'inherit' }}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography style={{ color: getStatusColor(task.status) }}>{task.status}</Typography>
              </TableCell>
              <TableCell>
                {task.attachments && task.attachments.length > 0 ? (
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {task.attachments.map((file, index) => (
                      <li key={index}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleFileDownload(file)}
                          startIcon={<DownloadIcon />}
                        >
                          {file.filename}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  'No files'
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={(event) => handleMenuOpen(event, task._id)}>
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleMenuAction('edit')}>Edit</MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')}>Delete</MenuItem>
        <MenuItem onClick={() => handleMenuAction('complete')}>Mark as Complete</MenuItem>
        <MenuItem onClick={() => handleMenuAction('pending')}>Mark as Pending</MenuItem>
      </Menu>
      <EditTaskModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEditedTask}
        task={taskToEdit}
        onFileUpload={handleFileUpload}
      />
      <TaskDetailsModal
        open={taskDetailsModalOpen}
        onClose={() => setTaskDetailsModalOpen(false)}
        task={selectedTask}
        onFileDownload={handleFileDownload}
      />
    </Card>
  );
}
