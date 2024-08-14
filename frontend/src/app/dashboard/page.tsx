'use client';

import { format } from 'path';

import * as React from 'react';
import { API_URL } from '@/constants';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import dayjs from 'dayjs';

import { config } from '@/config';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
});

export default function Page(): React.JSX.Element {
  const [pendingTasks, setPendingTasks] = React.useState([]);
  const [totalCustomers, setTotalCustomers] = React.useState(0);
  // const [formattedTasks, setFormattedTasks] = React.useState([]);
  React.useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const responseClients = await axiosInstance.get(`/employees/count`, {
          headers: {
            'x-auth-token': token,
          },
        });
        const responseTasks = await axiosInstance.get('/tasks/pending/all', {
          headers: {
            'x-auth-token': token,
          },
        });
        console.log('Clients:', responseClients.data);
        console.log('Tasks:', JSON.stringify(responseTasks.data, null, 2));
        setPendingTasks(responseTasks.data);
        setTotalCustomers(responseClients.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetch();
  }, []);

  React.useEffect(() => {
    console.log('Pending Tasks:', pendingTasks);
  }, [pendingTasks]);

  // const tasks = React.useMemo(() => {
  //   return pendingTasks.map((task) => ({
  //     id: task._id || 'N/A',
  //     customer: { name: task.client?.name || 'Unknown Client' },
  //     description: task.description || 'No description',
  //     dueDate: task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : 'No due date',
  //     status: task.status || 'Unknown',
  //   }));
  // }, [pendingTasks]);

  // console.log('Formatted Tasks', formattedTasks);

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item container xs={12} md={8} lg={6} spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <TotalCustomers diff={16} trend="down" sx={{ height: '100%' }} value={totalCustomers} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TotalProfit sx={{ height: '100%' }} value={pendingTasks.length} />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <LatestOrders orders={pendingTasks} sx={{ width: '100%' }} />
      </Grid>
    </Grid>
  );
}
