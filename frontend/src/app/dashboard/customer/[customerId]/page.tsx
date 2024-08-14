'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '@/constants';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import { Button, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import axios from 'axios';

import { AllTasks } from '@/components/dashboard/customer/all-tasks';
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
  const [role, setRole] = React.useState('analyst');
  console.log(API_URL);
  React.useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await axios.get<ClientDetails>(`${API_URL}/api/clients/${customerId}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        const role = await axios.get(`${API_URL}/api/employees/me`, {
          headers: {
            'x-auth-token': token,
          },
        });
        console.log(role.data);
        setRole(role.data.role);
        const response2 = await axios.get(`${API_URL}/api/tasks/pending/${customerId}`, {
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
        setTasks([]);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchClientDetails();
    fetchTasks();
  }, [customerId]);

  const handleAddTask = (newTask: any) => {
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
      {/* <CustomerFilters /> */}
      <Typography variant="h6">Assigned to Me</Typography>
      <CustomerTasksTable clientId={customerId} />
      <Typography variant="h6">Assigned by Me</Typography>
      <AssignedCustomerTasksTable clientId={customerId} />
      {role === 'advisor' && (
        <>
          <Typography variant="h6">All Tasks</Typography>
          <AllTasks clientId={customerId} />
        </>
      )}
      <AddTaskModal
        open={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
        clientId={customerId}
      />
      {/* {''} */}
    </Stack>
  );
};

export default Page;
