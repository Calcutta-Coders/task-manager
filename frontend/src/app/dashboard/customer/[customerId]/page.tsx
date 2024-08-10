'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';

import { CustomerFilters } from '@/components/dashboard/customer/customer-filters';
import { CustomerTasksTable, Task } from '@/components/dashboard/customer/customer-tasks-table';
import AddTaskModal from '@/components/dashboard/modals/addTask'; // Make sure this import path is correct

const Page = () => {
  const params = useParams();
  const customerId = params.customerId as string;
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Dummy API call
        // const response = await axios.get(`http://127.0.0.1:5500/api/customers/${customerId}/tasks`);
        // setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // For demonstration, let's set some dummy data
        setTasks([
          {
            id: '1',
            assigned: '2023-07-01',
            assignee: 'John Doe',
            name: 'Review Contract',
            description: 'Review and approve the new contract',
            dueDate: '2023-07-15',
            status: 'In Progress',
          },
          {
            id: '2',
            assigned: '2023-07-02',
            assignee: 'Jane Smith',
            name: 'Prepare Presentation',
            description: 'Prepare quarterly review presentation',
            dueDate: '2023-07-20',
            status: 'Not Started',
          },
          // Add more dummy tasks as needed
        ]);
      }
    };

    fetchTasks();
  }, [customerId]);

  const handleAddTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={1}>
          <Typography variant="h4">Customer Tasks</Typography>
          <Typography variant="body1">Customer ID: {customerId}</Typography>
        </Stack>
        <Button variant="contained" onClick={() => setIsAddTaskModalOpen(true)}>
          Add Task
        </Button>
      </Stack>
      <CustomerFilters />
      <CustomerTasksTable clientId={customerId} tasks={tasks} />
      <AddTaskModal
        open={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
        clientId={customerId}
      />
    </Stack>
  );
};

export default Page;
