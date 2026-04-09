import defaultTrackJson from '@assets/tracks/default.json';
import { Track, TrackData } from './Track';

function asNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid numeric field "${field}" in track JSON.`);
  }
  return value;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid string field "${field}" in track JSON.`);
  }
  return value;
}

export function parseTrackData(raw: unknown): TrackData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Track JSON must be an object.');
  }

  const candidate = raw as Partial<TrackData>;

  const id = asString(candidate.id, 'id');
  const name = asString(candidate.name, 'name');
  const width = asNumber(candidate.dimensions?.width, 'dimensions.width');
  const height = asNumber(candidate.dimensions?.height, 'dimensions.height');

  if (!Array.isArray(candidate.zones)) {
    throw new Error('Track JSON zones must be an array.');
  }

  const zones = candidate.zones.map((zone, index) => {
    if (!zone || typeof zone !== 'object') {
      throw new Error(`Invalid zone at index ${index}.`);
    }

    const typedZone = zone as TrackData['zones'][number];
    if (typedZone.shape !== 'rect') {
      throw new Error(`Unsupported zone shape at index ${index}.`);
    }

    return {
      label: typedZone.label,
      shape: 'rect' as const,
      x: asNumber(typedZone.x, `zones[${index}].x`),
      y: asNumber(typedZone.y, `zones[${index}].y`),
      width: asNumber(typedZone.width, `zones[${index}].width`),
      height: asNumber(typedZone.height, `zones[${index}].height`),
    };
  });

  return {
    id,
    name,
    dimensions: { width, height },
    zones,
  };
}

export function loadTrack(raw: unknown): Track {
  return new Track(parseTrackData(raw));
}

export function loadDefaultTrack(): Track {
  return loadTrack(defaultTrackJson);
}
