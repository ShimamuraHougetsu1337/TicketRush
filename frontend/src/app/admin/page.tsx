'use client';

import { Container, Box } from '@mui/material';
import AdminDashboard from '@/components/AdminDashboard';


export default function AdminPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <AdminDashboard />
      </Box>
    </Container>
  );
}
