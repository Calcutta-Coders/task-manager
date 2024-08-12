'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import axios from 'axios';

export function AccountDetailsForm(): React.JSX.Element {
  const [employee, setEmployee] = React.useState(null);

  React.useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('custom-auth-token');
        const response = await axios.get('http://127.0.0.1:5500/api/employees', {
          headers: {
            'x-auth-token': token,
          },
        });
        if (response.data && response.data.length > 0) {
          setEmployee(response.data[0]); // Assuming we want to display the first employee
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
      <CardHeader subheader="Employee information" title="Profile" />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>First name</InputLabel>
              <OutlinedInput value={employee.firstName} label="First name" name="firstName" readOnly />
            </FormControl>
          </Grid>
          <Grid md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Last name</InputLabel>
              <OutlinedInput value={employee.lastName} label="Last name" name="lastName" readOnly />
            </FormControl>
          </Grid>
          <Grid md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <OutlinedInput value={employee.role} label="Role" name="role" readOnly />
            </FormControl>
          </Grid>
          <Grid md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Email</InputLabel>
              <OutlinedInput value={employee.email} label="Email" name="email" readOnly />
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
