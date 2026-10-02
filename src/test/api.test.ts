import { describe, it, expect } from 'vitest';
import handler from '../../api/analyze';

describe('Serverless API Endpoint (/api/analyze)', () => {
  it('handles GET request and reports status and mode', async () => {
    let responseStatus = 0;
    let responseData: any = null;

    const req = {
      method: 'GET',
      headers: {}
    };

    const res = {
      setHeader: () => {},
      status: (code: number) => {
        responseStatus = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      }
    };

    await handler(req, res);

    expect(responseStatus).toBe(200);
    expect(responseData).toBeDefined();
    expect(responseData.status).toBe('online');
    expect(responseData.mode).toBeDefined();
  });

  it('handles POST request in demo mode without throwing', async () => {
    let responseStatus = 0;
    let responseData: any = null;

    const req = {
      method: 'POST',
      body: {
        message: 'We were charged twice on our credit card ($4,800). Please refund immediately.'
      },
      headers: {}
    };

    const res = {
      setHeader: () => {},
      status: (code: number) => {
        responseStatus = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      }
    };

    await handler(req, res);

    expect(responseStatus).toBe(200);
    expect(responseData.category).toBe('billing');
    expect(['high', 'urgent']).toContain(responseData.priority);
    expect(responseData.humanReviewRequired).toBe(true);
    expect(responseData.isDemoMode).toBe(true);
  });
});
