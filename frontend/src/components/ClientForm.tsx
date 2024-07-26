// frontend/src/components/ClientForm.js

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { addClient } from '@/actions/clients';

const ClientForm = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const { name, email, phone, address } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(addClient(formData));
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <div>
      <h2>Add Client</h2>
      <br />
      <br />
      <form onSubmit={onSubmit}>
        <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required />
        <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
        <input type="text" placeholder="Phone Number" name="phone" value={phone} onChange={onChange} />
        <input type="text" placeholder="Address" name="address" value={address} onChange={onChange} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ClientForm;
