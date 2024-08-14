'use client';

import * as React from 'react';
import { API_URL } from '@/constants';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import axios from 'axios';

export function AccountInfo(): React.JSX.Element {
  const [employee, setEmployee] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('custom-auth-token');
        const response = await axios.get(`${API_URL}/api/employees/me`, {
          headers: {
            'x-auth-token': token,
          },
        });
        if (response.data) {
          setEmployee(response.data); // Assuming we want to display the first employee
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployee();
  }, []);

  if (!employee) {
    return (
      <Card>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${employee.firstName + ' ' + employee.lastName}`}
              sx={{ height: '80px', width: '80px' }}
            />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{`${employee.firstName} ${employee.lastName}`}</Typography>
            <Typography color="text.secondary" variant="body2">
              {employee.role}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
    </Card>
  );
}
