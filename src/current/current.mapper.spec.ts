import { createCurrentResponse } from './current.mapper';
import type { CurrentRow } from './current.types';

describe('createCurrentResponse', () => {
  it('передает цвет тега вместе с текущим значением', () => {
    const now = new Date('2026-08-25T10:00:00.000Z');
    const row: CurrentRow = {
      edge: 'edge5',
      tag: 'hook-weight',
      value: 42,
      createdAt: now,
      updatedAt: now,
      name: 'Вес на крюке',
      tag_group: 'Бурение',
      min: 0,
      max: 100,
      comment: '',
      unit_of_measurement: 'т',
      precision: 1,
      color: '#FACC15',
    };

    expect(createCurrentResponse('edge5', [row]).items[0].color).toBe('#FACC15');
  });
});
