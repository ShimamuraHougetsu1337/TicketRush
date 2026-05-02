'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton, useTheme, alpha } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { PieChart } from '@mui/x-charts/PieChart';

interface DemographicsData {
  gender: {
    MALE: number;
    FEMALE: number;
    OTHER: number;
    UNKNOWN: number;
  };
  age: {
    [key: string]: number;
  };
}

interface DemographicsChartsProps {
  demographics: DemographicsData | null;
  loading: boolean;
}

export default function DemographicsCharts({ demographics, loading }: DemographicsChartsProps) {
  const theme = useTheme();

  const genderData = demographics ? [
    { id: 0, value: Number(demographics.gender.MALE), label: 'Male', color: theme.palette.primary.main },
    { id: 1, value: Number(demographics.gender.FEMALE), label: 'Female', color: theme.palette.secondary.main },
    { id: 2, value: Number(demographics.gender.OTHER), label: 'Other', color: theme.palette.warning.main },
  ].filter(d => d.value > 0) : [];

  const ageData = demographics ? Object.entries(demographics.age)
    .map(([label, value], id) => ({ id, value: Number(value), label }))
    .filter(d => d.value > 0) : [];

  return (
    <Grid container spacing={4} sx={{ mb: 8 }}>
      <Grid xs={12} md={6}>
        <Card sx={{ borderRadius: 5, border: '1px solid rgba(255,255,255,0.05)', background: alpha('#fff', 0.01) }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>Gender Distribution</Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
            ) : (
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <PieChart
                  series={[{
                    data: genderData,
                    innerRadius: 60,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                  }]}
                  width={400}
                  height={300}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={6}>
        <Card sx={{ borderRadius: 5, border: '1px solid rgba(255,255,255,0.05)', background: alpha('#fff', 0.01) }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>Age Brackets</Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
            ) : (
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                {/* <PieChart
                  series={[{
                    data: ageData,
                    innerRadius: 60,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    
                  }]}
                  width={400}
                  height={300}
                /> */}
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
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
