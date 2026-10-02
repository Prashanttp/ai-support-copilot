import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardView } from '../components/dashboard/DashboardView';
import { initialTickets } from '../data/mockTickets';

describe('DashboardView Component', () => {
  it('renders summary cards with ticket counts and labels', () => {
    const handleSelect = vi.fn();
    const handleTab = vi.fn();

    render(
      <DashboardView
        tickets={initialTickets}
        onSelectTicket={handleSelect}
        setActiveTab={handleTab}
        isLiveLLM={false}
      />
    );

    // Verify key summary cards are present
    expect(screen.getByText('Total Inquiries')).toBeInTheDocument();
    expect(screen.getByText('Urgent Priority')).toBeInTheDocument();
    expect(screen.getByText('AI Classification')).toBeInTheDocument();
    expect(screen.getByText('Awaiting Human Review')).toBeInTheDocument();

    // Verify guardrail banner is present
    expect(screen.getByText(/Supervised Autonomous Copilot/i)).toBeInTheDocument();
  });
});
