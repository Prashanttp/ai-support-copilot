import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InboxView } from '../components/inbox/InboxView';
import { initialTickets } from '../data/mockTickets';

describe('InboxView Component & Human-in-the-Loop Workflow', () => {
  it('renders all initial tickets with category, priority, and status badges', () => {
    const handleSelect = vi.fn();
    const handleUpdate = vi.fn();
    const handleReanalyze = vi.fn();
    const setSearchQuery = vi.fn();

    render(
      <InboxView
        tickets={initialTickets}
        selectedTicketId={null}
        onSelectTicket={handleSelect}
        onUpdateTicketStatus={handleUpdate}
        onReanalyzeTicket={handleReanalyze}
        searchQuery=""
        setSearchQuery={setSearchQuery}
      />
    );

    // Initial dataset has 8 tickets
    expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
  });

  it('filters tickets when category dropdown changes', () => {
    const handleSelect = vi.fn();
    const handleUpdate = vi.fn();
    const handleReanalyze = vi.fn();
    const setSearchQuery = vi.fn();

    const { container } = render(
      <InboxView
        tickets={initialTickets}
        selectedTicketId={null}
        onSelectTicket={handleSelect}
        onUpdateTicketStatus={handleUpdate}
        onReanalyzeTicket={handleReanalyze}
        searchQuery=""
        setSearchQuery={setSearchQuery}
      />
    );

    const categorySelect = container.querySelector('select');
    expect(categorySelect).not.toBeNull();
    if (categorySelect) {
      fireEvent.change(categorySelect, { target: { value: 'billing' } });
      // In mock dataset, billing tickets include Marcus Vance and Amina Al-Mansoor
      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
      expect(screen.getByText('Amina Al-Mansoor')).toBeInTheDocument();
      // Elena Rostova is 'product' so should be filtered out
      expect(screen.queryByText('Elena Rostova')).toBeNull();
    }
  });

  it('renders ticket details with Draft Only label and lets agents update status and edit drafts', () => {
    const handleSelect = vi.fn();
    const handleUpdate = vi.fn();
    const handleReanalyze = vi.fn();
    const setSearchQuery = vi.fn();

    const urgentTicket = initialTickets[0]; // TCK-1001

    render(
      <InboxView
        tickets={initialTickets}
        selectedTicketId={urgentTicket.id}
        onSelectTicket={handleSelect}
        onUpdateTicketStatus={handleUpdate}
        onReanalyzeTicket={handleReanalyze}
        searchQuery=""
        setSearchQuery={setSearchQuery}
      />
    );

    // Verify Draft Only guardrail label is displayed
    expect(screen.getByText(/Draft Only • Not Dispatched/i)).toBeInTheDocument();

    // Click "Approve Draft" button
    const approveBtn = screen.getByRole('button', { name: /Approve Draft/i });
    fireEvent.click(approveBtn);
    expect(handleUpdate).toHaveBeenCalledWith(urgentTicket.id, 'approved', expect.any(String));

    // Click "Needs Review" button
    const reviewBtn = screen.getByRole('button', { name: /Needs Review/i });
    fireEvent.click(reviewBtn);
    expect(handleUpdate).toHaveBeenCalledWith(urgentTicket.id, 'needs review', expect.any(String));

    // Click "Mark Resolved" button
    const resolveBtn = screen.getByRole('button', { name: /Mark Resolved/i });
    fireEvent.click(resolveBtn);
    expect(handleUpdate).toHaveBeenCalledWith(urgentTicket.id, 'resolved', expect.any(String));
  });
});
