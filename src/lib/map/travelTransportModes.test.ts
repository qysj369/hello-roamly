import { describe, expect, it } from 'vitest';
import {
  buildThemeStandards,
  buildTransportModeStandards,
  parseTransportMode,
} from '@/lib/map/travelTransportModes';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';

describe('parseTransportMode', () => {
  it('detects self-drive', () => {
    expect(parseTransportMode('周村青州潍坊四天自驾')).toBe('self_drive');
  });

  it('detects high-speed rail', () => {
    expect(parseTransportMode('济南到成都高铁三日')).toBe('high_speed_rail');
  });

  it('detects mixed modes', () => {
    expect(parseTransportMode('去程高铁返程大巴')).toBe('mixed');
  });

  it('defaults to auto when unspecified', () => {
    expect(parseTransportMode('扬州三天600')).toBe('auto');
  });
});

describe('parseTravelSearchIntent themes', () => {
  it('extracts camping and family themes', () => {
    const intent = parseTravelSearchIntent('周村青州潍坊四天自驾露营亲子');
    expect(intent.preferences).toContain('露营');
    expect(intent.preferences).toContain('亲子');
    expect(intent.selfDrive).toBe(true);
    expect(intent.transportMode).toBe('self_drive');
  });

  it('extracts fishing and picking', () => {
    const intent = parseTravelSearchIntent('微山湖垂钓采摘三日');
    expect(intent.preferences).toContain('垂钓');
    expect(intent.preferences).toContain('采摘');
  });
});

describe('buildTransportModeStandards', () => {
  it('includes bus guidance', () => {
    expect(buildTransportModeStandards('bus')).toContain('大巴');
  });

  it('includes theme blocks', () => {
    expect(buildThemeStandards(['露营', '亲子'])).toContain('露营');
    expect(buildThemeStandards(['露营', '亲子'])).toContain('亲子');
  });
});
