'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export type LeagueVisibility = 'public' | 'private';

interface PrivacySelectProps {
  value: LeagueVisibility
  onChange: (value: LeagueVisibility) => void
  label?: string
}

export function PrivacySelect({ value, onChange, label = '리그 공개 설정' }: PrivacySelectProps) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as LeagueVisibility)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="공개 설정을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">공개</SelectItem>
          <SelectItem value="private">비공개</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground pt-1">
        {value === 'public'
          ? '공개 리그는 모든 사용자가 볼 수 있습니다.'
          : '비공개 리그는 링크를 아는 사람만 볼 수 있습니다.'}
      </p>
    </div>
  );
}
