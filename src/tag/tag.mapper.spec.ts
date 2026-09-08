import { createTagResponse } from './tag.mapper';
import type { TagRow } from './tag.types';

describe('createTagResponse', () => {
  it('передает постоянный цвет тега в API', () => {
    const row: TagRow = {
      id: 'hook-weight',
      name: 'Вес на крюке',
      tag_group: 'Бурение',
      min: 0,
      max: 100,
      comment: '',
      unit_of_measurement: 'т',
      precision: 1,
      color: '#FACC15',
    };

    expect(createTagResponse([row]).items[0].color).toBe('#FACC15');
  });
});
