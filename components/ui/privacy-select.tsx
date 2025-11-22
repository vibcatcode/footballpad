'use client';

import { Eye, EyeOff, Lock } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type PrivacyValue = 'public' | 'private' | 'unlisted'

const PRIVACY_OPTIONS: Record<
  PrivacyValue,
  { label: string; description: string; Icon: typeof Eye; iconClass: string }
> = {
  public: {
    label: '공개',
    description: '모든 사용자가 볼 수 있습니다',
    Icon: Eye,
    iconClass: 'text-green-600',
  },
  unlisted: {
    label: '비공개 (링크 공유)',
    description: '링크를 아는 사람만 볼 수 있습니다',
    Icon: EyeOff,
    iconClass: 'text-yellow-600',
  },
  private: {
    label: '비공개',
    description: '나만 볼 수 있습니다',
    Icon: Lock,
    iconClass: 'text-red-600',
  },
}

interface PrivacySelectProps {
  value: PrivacyValue
  onChange: (value: PrivacyValue) => void
  label?: string
  description?: string
}

export function PrivacySelect({ value, onChange, label = '공개 설정', description }: PrivacySelectProps) {
  const selectedOption = value ? PRIVACY_OPTIONS[value] : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor="privacy">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full justify-between">
          <SelectValue className="sr-only" placeholder="공개 설정을 선택하세요" />
          {selectedOption ? (
            <div className="flex items-center space-x-2">
              <selectedOption.Icon className={`h-4 w-4 ${selectedOption.iconClass}`} />
              <span className="font-medium">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">공개 설정을 선택하세요</span>
          )}
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRIVACY_OPTIONS).map(([key, option]) => (
            <SelectItem key={key} value={key as PrivacyValue} className="data-[state=checked]:bg-accent/40">
              <div className="flex items-center space-x-2">
                <option.Icon className={`h-4 w-4 ${option.iconClass}`} />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
