'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Layers as ZoneIcon,
} from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ZoneInput {
  name: string;
  price: number;
  totalRows: number;
  seatsPerRow: number;
}

interface FormInput {
  title: string;
  startTime: string;
  status: string;
  zones: ZoneInput[];
}

export default function NewEventPage() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const { register, control, handleSubmit, formState: { errors } } = useForm<FormInput>({
    defaultValues: {
      title: '',
      startTime: '',
      status: 'UPCOMING',
      zones: [{ name: 'VIP', price: 100, totalRows: 5, seatsPerRow: 10 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'zones'
  });

  const onSubmit = async (data: FormInput) => {
    if (!session?.user?.accessToken) {
      setError('You must be logged in as Admin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      router.push('/admin/events');
      // KHÔNG gọi setLoading(false) ở đây để giữ trạng thái loading cho đến khi trang mới tải xong
    } catch (err: any) {
      setError(err.message);
      setLoading(false); // Chỉ tắt loading khi có lỗi để người dùng sửa và bấm lại
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Link href="/admin/events" passHref style={{ textDecoration: 'none' }}>
        <Button startIcon={<BackIcon />} sx={{ mb: 4, color: 'text.secondary' }}>
          Back to Events
        </Button>
      </Link>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif', mb: 1 }}>
          Create New Event
        </Typography>
        <Typography variant="body1" color="text.secondary">Fill in the details and configure the seating matrix</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Section A: Event Info */}
          <Card sx={{ borderRadius: 5, border: '1px solid rgba(255,255,255,0.05)', background: alpha('#fff', 0.01) }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: 'flex' }}>
                  <SaveIcon fontSize="small" />
                </Box>
                General Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    {...register('title', { required: 'Title is required' })}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                    {...register('startTime', { required: 'Start time is required' })}
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    defaultValue="UPCOMING"
                    {...register('status')}
                  >
                    <MenuItem value="UPCOMING">Upcoming</MenuItem>
                    <MenuItem value="ONGOING">Ongoing</MenuItem>
                    <MenuItem value="ENDED">Ended</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Section B: Zones */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, background: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, display: 'flex' }}>
                  <ZoneIcon fontSize="small" />
                </Box>
                Seating Zones
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => append({ name: '', price: 0, totalRows: 1, seatsPerRow: 1 })}
                sx={{ borderRadius: 2 }}
              >
                Add Zone
              </Button>
            </Box>

            <Stack spacing={3}>
              {fields.map((field, index) => (
                <Card key={field.id} sx={{ borderRadius: 4, position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <IconButton color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 3 }}>
                      ZONE #{index + 1}
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Zone Name"
                          placeholder="e.g. VIP, Standard"
                          {...register(`zones.${index}.name` as const, { required: 'Name is required' })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Price ($)"
                          type="number"
                          {...register(`zones.${index}.price` as const, { valueAsNumber: true, required: true })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Total Rows"
                          type="number"
                          helperText="e.g. 10 (A to J)"
                          {...register(`zones.${index}.totalRows` as const, { valueAsNumber: true, required: true, min: 1 })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Seats Per Row"
                          type="number"
                          helperText="e.g. 20 seats per row"
                          {...register(`zones.${index}.seatsPerRow` as const, { valueAsNumber: true, required: true, min: 1 })}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              py: 2,
              borderRadius: 4,
              fontSize: '1.1rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              color: '#0b0f19',
              boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)'
            }}
          >
            {loading ? 'Generating Event & Seats...' : 'Save Event & Generate Seats'}
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
