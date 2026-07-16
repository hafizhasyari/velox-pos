import { transport } from '../transport';
import type { ShiftRecord } from '../../types/pos';
import type { CurrentShiftState } from '../mocks/mockDatabase';

export interface ShiftInfoResponse {
  currentShift: CurrentShiftState;
  history: ShiftRecord[];
}

export const shiftService = {
  async getCurrentShift(): Promise<ShiftInfoResponse> {
    const res = await transport.get<ShiftInfoResponse>('/shifts/current');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to load shift state');
    }
    return res.data;
  },

  async openShift(openingCash: number): Promise<CurrentShiftState> {
    const res = await transport.post<CurrentShiftState>('/shifts/open', { openingCash });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to open shift');
    }
    return res.data;
  },

  async closeShift(countedCash: number, variance: number): Promise<{ closedRecord: ShiftRecord; history: ShiftRecord[] }> {
    const res = await transport.post<{ closedRecord: ShiftRecord; history: ShiftRecord[] }>('/shifts/close', { countedCash, variance });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to close shift');
    }
    return res.data;
  }
};
