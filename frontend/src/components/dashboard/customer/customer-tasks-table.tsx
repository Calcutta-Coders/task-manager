'use client';

import * as React from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Typography } from '@mui/material';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

export interface Task {
  _id: string;
  to: { firstName: string; lastName: string };
  from: { firstName: string; lastName: string };
  client: { name: string };
  title: string;
  description: string;
  status: 'To do' | 'Pending' | 'Completed';
  dueDate: string;
}

interface DecodedToken {
  user: {
    id: string;
  };
}

interface CustomerTasksTableProps {
  clientId: string;
}

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5500/api', // Adjust this if your API has a different base URL
  headers: {
    'x-auth-token': `${localStorage.getItem('custom-auth-token')}`, // Assuming you store the token in localStorage
  },
});
export function CustomerTasksTable({ clientId }: CustomerTasksTableProps): React.JSX.Element {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>(null);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const body = {
          headers: {
            'x-auth-token': token,
          },
        });
        const response = await axiosInstance.get<any>(`/tasks/${clientId}`, body);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const fetchedTasks: any = await response.json();
        console.log(fetchedTasks);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Handle error (e.g., show error message to user)
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

  const handleMenuAction = (action: string) => {
    if (selectedTaskId) {
      let updatedTasks = [...tasks];
      const taskIndex = updatedTasks.findIndex((task) => task._id === selectedTaskId);

      if (taskIndex !== -1) {
        if (action === 'edit') {
          // Implement edit functionality
          console.log(`Editing task ${selectedTaskId}`);
        } else if (action === 'delete') {
          updatedTasks.splice(taskIndex, 1);
        } else if (action === 'complete') {
          updatedTasks[taskIndex].status = 'Completed';
        } else if (action === 'pending') {
          updatedTasks[taskIndex].status = 'Pending';
        }

        setTasks(updatedTasks);
      }
    }
    handleMenuClose();
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
      sortableTasks.sort((a, b) => {
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
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTasks.map((task) => (
            <TableRow key={task._id}>
              <TableCell>{`${task.to.firstName} ${task.to.lastName}`}</TableCell>
              <TableCell>{`${task.from.firstName} ${task.from.lastName}`}</TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.description}</TableCell>
              <TableCell>
                <Typography style={{ color: isDateWithin5Days(task.dueDate) ? 'red' : 'inherit' }}>
                  {task.dueDate}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography style={{ color: getStatusColor(task.status) }}>{task.status}</Typography>
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
    </Card>
  );
}
