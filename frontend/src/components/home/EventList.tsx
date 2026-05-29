'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
} from '@mui/material';
import EventCard from './EventCard';
import EmptyState from './EmptyState';

interface EventListProps {
  events: any[];
  searchQuery: string;
}

export default function EventList({ events, searchQuery }: EventListProps) {
  const filteredEvents = events?.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isUpcomingOrOngoing = event.status !== 'ENDED';
    return matchesSearch && isUpcomingOrOngoing;
  });

  return (
    <Container maxWidth="lg" id="events-section">
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1, fontFamily: '"Outfit", sans-serif' }}>
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Events'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchQuery ? `${filteredEvents?.length || 0} events found` : 'Handpicked experiences just for you'}
          </Typography>
        </Box>
      </Box>

      {filteredEvents?.length === 0 ? (
        <EmptyState searchQuery={searchQuery} />
      ) : (
        <Grid container spacing={4}>
          {filteredEvents?.map((event: any) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
