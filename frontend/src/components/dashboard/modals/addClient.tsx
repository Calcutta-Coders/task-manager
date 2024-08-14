'use client';

import * as React from 'react';
import { API_URL } from '@/constants';
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Modal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';

interface Client {
  _id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
}

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onAddClient: (client: Client) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ open, onClose, onAddClient }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newClient, setNewClient] = React.useState<Omit<Client, '_id'>>({
    name: '',
    email: '',
    company: '',
    phone: '',
  });
  const [error, setError] = React.useState('');

  // Create an Axios instance with default headers
  const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`, // Adjust this if your API has a different base URL
    headers: {
      'x-auth-token': `${localStorage.getItem('custom-auth-token')}`, // Assuming you store the token in localStorage
    },
  });

  const fetchClients = async (search: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<Client[]>(`/clients`, {
        params: { search },
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (searchTerm) {
      fetchClients(searchTerm);
    } else {
      setClients([]);
    }
  }, [searchTerm]);

  const handleAddClient = async () => {
    try {
      const response = await axiosInstance.post<Client>('/clients', newClient);
      onAddClient(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding client:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleAddClientToEmployee = async (clientId: string) => {
    try {
      console.log(clientId);
      await axiosInstance.post('/clients/add-to-employee', { clientId });
      onClose(); // Close the modal if the client is successfully added
    } catch (error) {
      console.error('Error adding client to employee:', error);
      if (error.response && error.response.status === 400) {
        setError("Client already added to employee's list");
      } else {
        // Handle other errors (e.g., show a generic error message)
        setError('An error occurred. Please try again.');
      }
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
          Add Client
        </Typography>
        <TextField
          label="Search Clients"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
        />
        {loading ? (
          <CircularProgress />
        ) : clients.length > 0 ? (
          <List>
            {clients.map((client) => (
              <ListItem button key={client._id} onClick={() => handleAddClientToEmployee(client._id)}>
                <ListItemText primary={client.name} secondary={client.company} />
              </ListItem>
            ))}
          </List>
        ) : (
          searchTerm && (
            <Box mt={2}>
              <Typography>No clients found.</Typography>
              <Button variant="contained" onClick={() => setShowAddForm(true)} sx={{ mt: 1 }}>
                Add New Client
              </Button>
            </Box>
          )
        )}
        {showAddForm && (
          <Stack spacing={2} mt={2}>
            <TextField
              label="Name"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Company"
              value={newClient.company}
              onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              fullWidth
            />
            <Button variant="contained" onClick={handleAddClient}>
              Add
            </Button>
          </Stack>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default AddClientModal;
