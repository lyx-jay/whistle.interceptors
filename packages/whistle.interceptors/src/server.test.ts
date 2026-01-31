import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseQuery, handleOrMode } from './server';
import { PROXY_MODE } from './uiServer/constant';

describe('server.ts optimizations', () => {
  describe('parseQuery', () => {
    it('should parse query string correctly', () => {
      expect(parseQuery('?a=1&b=2')).toEqual({ a: '1', b: '2' });
      expect(parseQuery('a=1&b=2')).toEqual({ a: '1', b: '2' });
      expect(parseQuery('?name=%E5%BC%A0%E4%B8%89')).toEqual({ name: '张三' });
    });

    it('should handle empty or malformed query string', () => {
      expect(parseQuery('')).toEqual({});
      expect(parseQuery('?')).toEqual({});
      expect(parseQuery('a=')).toEqual({});
    });
  });

  describe('handleOrMode', () => {
    let mockRes: any;
    let mockReq: any;
    let mockOptions: any;
    let extra: any;

    beforeEach(() => {
      mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
      };
      mockReq = {
        getSession: vi.fn(),
        passThrough: vi.fn(),
      };
      mockOptions = {
        localStorage: {
          setProperty: vi.fn(),
        },
      };
      extra = { origin: 'http://localhost' };
    });

    it('should match a condition and return mock response', () => {
      const conditions = [
        {
          ruleId: 'rule1',
          enabled: true,
          pairs: [{ key: 'id', value: '123' }],
          response: '{"status": "ok"}',
          proxyMode: PROXY_MODE.MOCK,
        },
      ];
      const payload = { id: '123' };

      const result = handleOrMode({ conditions, payload, res: mockRes, req: mockReq, options: mockOptions, extra });

      expect(result).toBe(false); // Should return false to indicate match handled
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json; charset=UTF-8');
      expect(mockRes.end).toHaveBeenCalledWith('{"status": "ok"}');
    });

    it('should return true if no condition matches', () => {
      const conditions = [
        {
          ruleId: 'rule1',
          enabled: true,
          pairs: [{ key: 'id', value: '123' }],
          response: '{"status": "ok"}',
          proxyMode: PROXY_MODE.MOCK,
        },
      ];
      const payload = { id: '456' };

      const result = handleOrMode({ conditions, payload, res: mockRes, req: mockReq, options: mockOptions, extra });

      expect(result).toBe(true);
      expect(mockRes.end).not.toHaveBeenCalled();
    });

    it('should skip disabled conditions', () => {
      const conditions = [
        {
          ruleId: 'rule1',
          enabled: false,
          pairs: [{ key: 'id', value: '123' }],
          response: '{"status": "ok"}',
          proxyMode: PROXY_MODE.MOCK,
        },
      ];
      const payload = { id: '123' };

      const result = handleOrMode({ conditions, payload, res: mockRes, req: mockReq, options: mockOptions, extra });

      expect(result).toBe(true);
    });

    describe('matchMode: fuzzy vs exact', () => {
      it('should match fuzzy by default (substring)', () => {
        const conditions = [
          {
            ruleId: 'rule1',
            enabled: true,
            pairs: [{ key: 'channel_code', value: '123' }], // Default fuzzy
            response: '{"match": "fuzzy"}',
            proxyMode: PROXY_MODE.MOCK,
          },
        ];
        const payload = { channel_code: '123,456,789' };

        const result = handleOrMode({ conditions, payload, res: mockRes, req: mockReq, options: mockOptions, extra });

        expect(result).toBe(false);
        expect(mockRes.end).toHaveBeenCalledWith('{"match": "fuzzy"}');
      });

      it('should NOT match fuzzy if substring is not present', () => {
        const conditions = [
          {
            ruleId: 'rule1',
            enabled: true,
            pairs: [{ key: 'channel_code', value: '123', matchMode: 'fuzzy' as const }],
            response: '{"match": "fuzzy"}',
            proxyMode: PROXY_MODE.MOCK,
          },
        ];
        const payload = { channel_code: '456,789' };

        const result = handleOrMode({ conditions, payload, res: mockRes, req: mockReq, options: mockOptions, extra });

        expect(result).toBe(true);
        expect(mockRes.end).not.toHaveBeenCalled();
      });

      it('should NOT match exact if values are not strictly equal', () => {
        const conditions = [
          {
            ruleId: 'rule1',
            enabled: true,
            pairs: [{ key: 'channel_code', value: '123', matchMode: 'exact' as const }],
            response: '{"match": "exact"}',
            proxyMode: PROXY_MODE.MOCK,
          },
        ];
        const payload = { channel_code: '123,456,789' };

        const result = handleOrMode({ conditions, payload, res: mockRes, req: mockReq, options: mockOptions, extra });

        expect(result).toBe(true);
        expect(mockRes.end).not.toHaveBeenCalled();
      });

      it('should match exact if values are strictly equal', () => {
        const conditions = [
          {
            ruleId: 'rule1',
            enabled: true,
            pairs: [{ key: 'channel_code', value: '123', matchMode: 'exact' as const }],
            response: '{"match": "exact"}',
            proxyMode: PROXY_MODE.MOCK,
          },
        ];
        const payload = { channel_code: '123' };

        const result = handleOrMode({ conditions, payload, res: mockRes, req: mockReq, options: mockOptions, extra });

        expect(result).toBe(false);
        expect(mockRes.end).toHaveBeenCalledWith('{"match": "exact"}');
      });
    });
  });
});
