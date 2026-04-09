export type ZoneLabel = 'asphalt' | 'grass' | 'barrier' | 'startLine';

export type RectZone = {
  label: ZoneLabel;
  shape: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TrackData = {
  id: string;
  name: string;
  dimensions: {
    width: number;
    height: number;
  };
  zones: RectZone[];
};

const SURFACE_PRIORITY: ZoneLabel[] = ['barrier', 'startLine', 'asphalt', 'grass'];

function isPointInRect(x: number, y: number, zone: RectZone) {
  return x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height;
}

export class Track {
  readonly id: string;
  readonly name: string;
  readonly dimensions: TrackData['dimensions'];
  readonly zones: RectZone[];

  constructor(data: TrackData) {
    this.id = data.id;
    this.name = data.name;
    this.dimensions = data.dimensions;
    this.zones = data.zones;
  }

  getSurfaceAt(x: number, y: number): ZoneLabel {
    for (const label of SURFACE_PRIORITY) {
      const matched = this.zones.find((zone) => zone.label === label && isPointInRect(x, y, zone));
      if (matched) {
        return matched.label;
      }
    }
    return 'grass';
  }

  getZoneByLabel(label: ZoneLabel): RectZone[] {
    return this.zones.filter((zone) => zone.label === label);
  }
}
