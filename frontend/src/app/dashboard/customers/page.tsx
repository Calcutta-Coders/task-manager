'use client';

import * as React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import axios from 'axios';
import dayjs from 'dayjs';

import { config } from '@/config';
import { CustomersFilters } from '@/components/dashboard/customers/customers-filters';
import { CustomersTable } from '@/components/dashboard/customers/customers-table';
import type { Customer } from '@/components/dashboard/customers/customers-table';
import AddClientModal from '@/components/dashboard/modals/addClient';

const Page = () => {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const page = 0;
  const rowsPerPage = 5;

  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('custom-auth-token');
        console.log(token); // Retrieve token from local storage
        const headers = { 'x-auth-token': token };

        const response = await axios.get('http://127.0.0.1:5500/api/clients/specific', { headers });
        console.log(response);
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  const handleAddClient = (client: any) => {
    // Here you can make an API call to add the client to the server
    setCustomers((prevCustomers) => [...prevCustomers, client]);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Customers</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}></Stack>
        </Stack>
        <div>
          <Button
            onClick={() => setIsModalOpen(true)}
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
          >
            Add
          </Button>
        </div>
      </Stack>
      <CustomersFilters />
      <CustomersTable
        count={paginatedCustomers.length}
        page={page}
        rows={paginatedCustomers}
        rowsPerPage={rowsPerPage}
      />
      <AddClientModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onAddClient={handleAddClient} />
    </Stack>
  );
};

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default Page;
