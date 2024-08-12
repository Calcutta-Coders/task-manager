'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import { Button, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import axios from 'axios';

import { AssignedCustomerTasksTable } from '@/components/dashboard/customer/assigned-customer-tasks-table';
import { CustomerFilters } from '@/components/dashboard/customer/customer-filters';
import { CustomerTasksTable, Task } from '@/components/dashboard/customer/customer-tasks-table';
import AddTaskModal from '@/components/dashboard/modals/addTask';

interface ClientDetails {
  _id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  pendingTasksCount: number;
}

const Page = () => {
  const [pendingTasks, setPendingTasks] = React.useState<any>();
  const params = useParams();
  const customerId = params.customerId as string;
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [clientDetails, setClientDetails] = React.useState<ClientDetails | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await axios.get<ClientDetails>(`http://127.0.0.1:5500/api/clients/${customerId}`, {
          headers: {
            'x-auth-token': token,
          },
        });

        const response2 = await axios.get(`http://127.0.0.1:5500/api/tasks/pending/${customerId}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        console.log('Pending tasks: ', response2);
        console.log(response.data);
        setClientDetails(response.data);
        setPendingTasks(response2.data.length);
      } catch (error) {
        console.error('Error fetching client details:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    const fetchTasks = async () => {
      try {
        // Your existing task fetching logic here
        // For now, we'll keep the dummy data
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
        ]);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchClientDetails();
    fetchTasks();
  }, [customerId]);

  const handleAddTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="h4">Customer Details</Typography>
        <Button variant="contained" onClick={() => setIsAddTaskModalOpen(true)}>
          Add Task
        </Button>
      </Stack>

      {clientDetails && (
        <Card elevation={3}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  {clientDetails.name}
                </Typography>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BusinessIcon color="action" />
                  <Typography variant="body1">{clientDetails.company}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon color="action" />
                  <Typography variant="body1">{clientDetails.email}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon color="action" />
                  <Typography variant="body1">{clientDetails.phone}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentIcon color="action" />
                  <Typography variant="body1">Pending Tasks: {pendingTasks}</Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Typography variant="h5">Tasks</Typography>
      <CustomerFilters />
      <CustomerTasksTable clientId={customerId} tasks={tasks} clientDetails={clientDetails} />
      <AssignedCustomerTasksTable clientId={customerId} tasks={tasks} clientDetails={clientDetails} />
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
