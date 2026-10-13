import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';

const push = vi.fn();
const notFound = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ id: '42' }),
  notFound: () => notFound(),
}));

vi.mock('@/services/logService', () => ({
  logService: { getActivityLog: vi.fn() },
}));

import DetailActivityLog from '@/components/admin/activity-logs/DetailView';
import { logService } from '@/services/logService';

const mockedGet = vi.mocked(logService.getActivityLog);

const log = {
  id: 42,
  userId: 1,
  action: 'UPDATE',
  description: 'Role updated',
  subjectType: 'Role',
  subjectId: 2,
  oldData: { title: 'Editor', access: ['a.index'], meta: { level: 1 } },
  newData: { title: 'Editors', access: ['a.index', 'a.create'], meta: { level: 2 } },
  createdAt: '2026-10-12T07:00:00.000Z',
  causedAt: '12 October 2026 at 07:00',
  user: null,
};

const rowOf = (field: string) => screen.getByText(field).closest('tr')!;

beforeEach(() => {
  mockedGet.mockResolvedValue({ data: log } as never);
});

describe('DetailActivityLog', () => {
  it('loads the log by id and shows a dash for a system action', async () => {
    render(<DetailActivityLog />);

    expect(await screen.findByText('Role updated')).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledWith('42');
    expect(screen.getByText('Caused By').nextElementSibling).toHaveTextContent('—');
  });

  it('lists primitive arrays and prints nested objects as JSON', async () => {
    render(<DetailActivityLog />);

    await screen.findByText('Data Changes');
    expect(within(rowOf('access')).getAllByRole('listitem').map((li) => li.textContent))
      .toEqual(['a.index', 'a.index', 'a.create']);
    expect(rowOf('meta')).toHaveTextContent('"level": 2');
    expect(rowOf('meta')).not.toHaveTextContent('[object Object]');
  });

  it('skips the changes for empty snapshots but keeps the way back', async () => {
    const u = userEvent.setup();
    mockedGet.mockResolvedValue({ data: { ...log, oldData: [], newData: [] } } as never);
    render(<DetailActivityLog />);

    await screen.findByText('Role updated');
    expect(screen.queryByText('Data Changes')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Back to Logs' }));
    expect(push).toHaveBeenCalledWith('/admin/activity-logs');
  });

  it('hands a missing log to the not-found page', async () => {
    const err = new AxiosError('Not found');
    err.response = {
      data: { message: 'Activity log not found' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: { headers: {} } as never,
    };
    mockedGet.mockRejectedValue(err);
    render(<DetailActivityLog />);

    await waitFor(() => expect(notFound).toHaveBeenCalled());
  });

  it('offers a retry, not the not-found page, when loading fails', async () => {
    const u = userEvent.setup();
    mockedGet.mockRejectedValueOnce(new AxiosError('Network Error'));
    render(<DetailActivityLog />);

    await u.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Role updated')).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });
});
