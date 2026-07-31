import { MapPin } from 'lucide-react';
import TravelMomentMapPicker from '@/components/features/moments/TravelMomentMapPicker';
import TravelMomentTagPicker from '@/components/features/moments/TravelMomentTagPicker';
import { TRAVEL_MOMENT_MEDIA_LIMITS } from '@/utils/travelMomentMedia';
import { TRAVEL_MOMENT_TAG_LIMITS } from '@/utils/travelMomentTags';
import type { TravelMomentLocationValue } from '@/utils/travelMomentLocation';

export type TravelMomentComposeFieldsProps = {
  title: string;
  description: string;
  detail: string;
  tags: string[];
  locationPin: TravelMomentLocationValue;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDetailChange: (value: string) => void;
  onTagsChange: (value: string[]) => void;
  onLocationPinChange: (value: TravelMomentLocationValue) => void;
};

export default function TravelMomentComposeFields({
  title,
  description,
  detail,
  tags,
  locationPin,
  onTitleChange,
  onDescriptionChange,
  onDetailChange,
  onTagsChange,
  onLocationPinChange,
}: TravelMomentComposeFieldsProps) {
  return (
    <div className="space-y-3">
      <label className="block" htmlFor="moment-title">
        <span className="mb-1 block text-xs font-medium text-slate-600">标题（可选）</span>
        <input
          id="moment-title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="给瞬间起个标题"
          maxLength={TRAVEL_MOMENT_MEDIA_LIMITS.maxTitleLength}
          className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </label>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="moment-description">
          描述 <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="moment-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="用一两句话描述这个瞬间，如味道、风景或心情…"
          rows={3}
          maxLength={TRAVEL_MOMENT_TAG_LIMITS.maxDescriptionLength}
          className="block w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <p className="mt-1 text-right text-xs text-slate-500">
          {description.length}/{TRAVEL_MOMENT_TAG_LIMITS.maxDescriptionLength}
        </p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="moment-detail">
          详细内容（可选）
        </label>
        <textarea
          id="moment-detail"
          value={detail}
          onChange={(event) => onDetailChange(event.target.value)}
          placeholder="补充更多故事、攻略或避坑提示…"
          rows={4}
          maxLength={TRAVEL_MOMENT_TAG_LIMITS.maxDetailLength}
          className="block w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </div>
      <TravelMomentTagPicker value={tags} onChange={onTagsChange} />
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-600" htmlFor="moment-location-input">
          位置标记
        </label>
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="moment-location-input"
            type="text"
            value={locationPin.label}
            onChange={(event) =>
              onLocationPinChange({
                label: event.target.value,
                coordinates: undefined,
                countryCode: undefined,
              })
            }
            placeholder="地点名称，或点击下方地图选点"
            className="block w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <TravelMomentMapPicker value={locationPin} onChange={onLocationPinChange} />
      </div>
    </div>
  );
}
