import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '@/components/home/HeroSection';
import EventList from '@/components/home/EventList';

export const metadata = {
  title: 'TicketRush | Grab Your Tickets Before They\'re Gone',
  description: 'Join thousands of fans securing seats in real-time with our high-concurrency booking engine.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getEvents(search?: string) {
  try {
    const url = new URL(`${API_URL}/api/events`);
    if (search) url.searchParams.append('search', search);

    const res = await fetch(url.toString(), {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const searchQuery = searchParams.search || '';
  const events = await getEvents(searchQuery);

  return (
    <Box sx={{ pb: 10 }}>
      <HeroSection />

      <EventList
        events={events}
        searchQuery={searchQuery}
      />
    </Box>
  );
}
