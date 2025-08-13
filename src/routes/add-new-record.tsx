import { createFileRoute } from '@tanstack/react-router'
import { Box, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl, IconButton } from '@mui/material'
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material'
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createRecord } from '../api/records'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/add-new-record')({
  component: AddNewRecord,
})

const recordTypes = ['Business', 'Building Permit', 'Zoning Variance'];

function AddNewRecord() {
  const navigate = useNavigate();
  const [recordType, setRecordType] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [description, setDescription] = useState('');
  const [tenure, setTenure] = useState<number | ''>('');
  const [emails, setEmails] = useState<string[]>(['']);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [addresses, setAddresses] = useState<string[]>(['']);

  const createRecordMutation = useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      alert('Record created successfully!');
      navigate({ to: '/' }); // Navigate back to dashboard after success
    },
    onError: (error) => {
      alert(`Error creating record: ${error.message}`);
    },
  });

  const handleAddEmail = () => setEmails([...emails, '']);
  const handleRemoveEmail = (index: number) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    setEmails(newEmails);
  };
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleAddPhoneNumber = () => setPhoneNumbers([...phoneNumbers, '']);
  const handleRemovePhoneNumber = (index: number) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers.splice(index, 1);
    setPhoneNumbers(newPhoneNumbers);
  };
  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  const handleAddAddress = () => setAddresses([...addresses, '']);
  const handleRemoveAddress = (index: number) => {
    const newAddresses = [...addresses];
    newAddresses.splice(index, 1);
    setAddresses(newAddresses);
  };
  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    if (!recordType || !applicantName || emails.some(e => !e) || phoneNumbers.some(p => !p) || addresses.some(a => !a)) {
      alert('Please fill in all required fields.');
      return;
    }

    const newRecord = {
      recordType,
      applicantName,
      addresses: addresses.filter(a => a !== ''),
      recordStatus: 'Pending', // Default status
      emails: emails.filter(e => e !== ''),
      phoneNumbers: phoneNumbers.filter(p => p !== ''),
      description: description || undefined,
      tenure: tenure || undefined,
    };

    createRecordMutation.mutate(newRecord);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Add New Record</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Record Information</Typography>
        <FormControl fullWidth required>
          <InputLabel id="record-type-label">Record Type</InputLabel>
          <Select
            labelId="record-type-label"
            value={recordType}
            label="Record Type"
            onChange={(e) => setRecordType(e.target.value as string)}
          >
            {recordTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="Record ID (Auto-generated)" fullWidth disabled value="Will be auto-generated based on record type" />
        <TextField
          label="Applicant Name"
          fullWidth
          required
          value={applicantName}
          onChange={(e) => setApplicantName(e.target.value)}
          placeholder="Default Applicant (can be changed)"
        />
        <TextField label="Date Submitted (Today's date)" fullWidth disabled value={new Date().toLocaleDateString()} />
        <TextField
          label="Tenure (Years)"
          fullWidth
          type="number"
          value={tenure}
          onChange={(e) => setTenure(Number(e.target.value))}
          placeholder="Enter tenure in years"
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the record..."
        />

        <Typography variant="h6" sx={{ mt: 3 }}>Contact & Address Information</Typography>

        {emails.map((email, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label={`Email Address ${index + 1}`}
              fullWidth
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              placeholder="email@example.com"
            />
            {emails.length > 1 && (
              <IconButton onClick={() => handleRemoveEmail(index)} color="error">
                <RemoveCircleOutline />
              </IconButton>
            )}
          </Box>
        ))}
        <Button onClick={handleAddEmail} startIcon={<AddCircleOutline />}>Add another email</Button>

        {phoneNumbers.map((phoneNumber, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label={`Phone Number ${index + 1}`}
              fullWidth
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
              placeholder="555-0123"
            />
            {phoneNumbers.length > 1 && (
              <IconButton onClick={() => handleRemovePhoneNumber(index)} color="error">
                <RemoveCircleOutline />
              </IconButton>
            )}
          </Box>
        ))}
        <Button onClick={handleAddPhoneNumber} startIcon={<AddCircleOutline />}>Add another phone number</Button>

        {addresses.map((address, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label={`Address ${index + 1}`}
              fullWidth
              value={address}
              onChange={(e) => handleAddressChange(index, e.target.value)}
              placeholder="123 Main St, City, State 12345"
            />
            {addresses.length > 1 && (
              <IconButton onClick={() => handleRemoveAddress(index)} color="error">
                <RemoveCircleOutline />
              </IconButton>
            )}
          </Box>
        ))}
        <Button onClick={handleAddAddress} startIcon={<AddCircleOutline />}>Add another address</Button>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate({ to: '/' })}>Cancel</Button>
          <Button variant="contained" type="submit" disabled={createRecordMutation.isPending}>Create Record</Button>
        </Box>
      </Box>
    </Box>
  );
}