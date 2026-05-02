'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  alpha,
  useTheme,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  ConfirmationNumber,
  AttachMoney,
  LocationOn,
  Event as EventIcon,
} from '@mui/icons-material';
import { PieChart, BarChart } from '@mui/x-charts';

interface DetailedEventStatsProps {
  data: {
    event: { id: number; title: string; startTime: string; location: string; };
    summary: {
      totalSeats: number; soldSeats: number; lockedSeats: number;
      availableSeats: number; fillRate: string; totalRevenue: number;
    };
    zones: Array<{ name: string; price: number; total: number; sold: number; revenue: number; }>;
    salesOverTime: Array<{ date: string; revenue: number; }>;
    demographics: {
      gender: { MALE: number; FEMALE: number; OTHER: number; UNKNOWN: number };
      age: Record<string, number>;
    };
  };
}

export default function DetailedEventStats({ data }: DetailedEventStatsProps) {
  const theme = useTheme();

  const genderData = [
    { id: 0, value: data.demographics.gender.MALE, label: 'Male', color: theme.palette.primary.main },
    { id: 1, value: data.demographics.gender.FEMALE, label: 'Female', color: theme.palette.secondary.main },
    { id: 2, value: data.demographics.gender.OTHER, label: 'Other', color: theme.palette.info.main },
  ].filter(d => d.value > 0);

  const ageOrder = ['Under 18', '18-24', '25-34', '35-44', '45+'];
  const ageData = ageOrder.map(label => ({
    label,
    value: data.demographics.age[label] || 0
  }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 1, fontFamily: '"Outfit", sans-serif' }}>
          {data.event.title}
        </Typography>
        <Stack direction="row" spacing={3} color="text.secondary">
          <Stack direction="row" spacing={1} alignItems="center">
            <EventIcon fontSize="small" />
            <Typography variant="body2">{new Date(data.event.startTime).toLocaleString()}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOn fontSize="small" />
            <Typography variant="body2">{data.event.location}</Typography>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Metric Cards */}
        {[
          { label: 'Total Revenue', val: `$${data.summary.totalRevenue.toLocaleString()}`, icon: <AttachMoney />, col: 'primary' },
          { label: 'Tickets Sold', val: data.summary.soldSeats, sub: `of ${data.summary.totalSeats}`, icon: <ConfirmationNumber />, col: 'secondary' },
          { label: 'Fill Rate', val: `${data.summary.fillRate}%`, icon: <TrendingUp />, col: 'info', progress: Number(data.summary.fillRate) },
          { label: 'Unique Visitors', val: Object.values(data.demographics.gender).reduce((a, b) => a + b, 0), icon: <People />, col: 'warning' },
        ].map((m, i) => {
          const colorKey = m.col as 'primary' | 'secondary' | 'info' | 'warning';
          return (
            <Grid item xs={12} md={3} key={i}>
              <Card sx={{
                height: '100%',
                borderRadius: 2,
                background: alpha(theme.palette[colorKey].main, 0.05),
                border: `1px solid ${alpha(theme.palette[colorKey].main, 0.1)}`
              }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{
                      p: 1,
                      borderRadius: 2,
                      background: alpha(theme.palette[colorKey].main, 0.1),
                      width: 'fit-content',
                      color: `${colorKey}.main`
                    }}>{m.icon}</Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>{m.label}</Typography>
                      <Typography variant="h4" fontWeight={900}>{m.val}</Typography>
                      {m.sub && <Typography variant="caption" color="text.secondary">{m.sub}</Typography>}
                      {m.progress !== undefined && <LinearProgress variant="determinate" value={m.progress} sx={{ mt: 1, height: 6, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }} />}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, p: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Sales Performance (Last 7 Days)</Typography>
              <Box sx={{ height: 320, width: '100%' }}>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: data.salesOverTime.map(d => d.date),
                    tickLabelStyle: {
                      angle: -40,
                      textAnchor: 'end',
                      fontSize: 11,
                      fill: theme.palette.text.secondary
                    }
                  }]}
                  series={[{
                    data: data.salesOverTime.map(d => d.revenue),
                    color: theme.palette.primary.main,
                    label: 'Revenue',
                    valueFormatter: (v) => `$${v?.toLocaleString()}`
                  }]}
                  borderRadius={6}
                  height={320}
                  margin={{ left: 65, right: 20, top: 20, bottom: 65 }}
                  grid={{ horizontal: true }}
                  slotProps={{
                    legend: { hidden: true }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gender Split */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, p: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Gender Distribution</Typography>
              <Box sx={{ height: 200, width: '100%', position: 'relative' }}>
                <PieChart
                  series={[{
                    data: genderData, innerRadius: 60, outerRadius: 80, paddingAngle: 5, cornerRadius: 5,
                    cx: '50%', cy: '50%', highlightScope: { faded: 'global', highlighted: 'item' },
                  }]}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  slotProps={{ legend: { hidden: true } }}
                />
              </Box>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }} flexWrap="wrap">
                {genderData.map(d => (
                  <Stack key={d.label} direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
                    <Typography variant="caption">{d.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Zone Breakdown */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>Zone Occupancy & Revenue</Typography>
              <Stack spacing={3}>
                {data.zones.map((zone) => (
                  <Box key={zone.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{zone.name} (${zone.price})</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {zone.sold} / {zone.total} sold (${zone.revenue.toLocaleString()})
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={(zone.sold / zone.total) * 100} sx={{ height: 8, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Age Group Distribution - PieChart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, p: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Audience by Age Group</Typography>
              <Box sx={{ height: 280, width: '100%', position: 'relative' }}>
                <PieChart
                  series={[{
                    data: ageData.map((d, idx) => ({
                      id: idx,
                      value: d.value,
                      label: d.label,
                      color: [
                        theme.palette.primary.main,
                        theme.palette.secondary.main,
                        theme.palette.info.main,
                        theme.palette.warning.main,
                        theme.palette.error.main,
                      ][idx % 5]
                    })),
                    innerRadius: 70,
                    outerRadius: 100,
                    paddingAngle: 3,
                    cornerRadius: 6,
                    cx: '50%',
                    cy: '50%',
                    highlightScope: { faded: 'global', highlighted: 'item' },
                  }]}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                      padding: 0,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}