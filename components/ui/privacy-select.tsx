'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PrivacySelectProps {
  value: 'public' | 'private' | 'unlisted';
  onChange: (value: 'public' | 'private' | 'unlisted') => void;
  label?: string;
  description?: string;
}

export function PrivacySelect({ value, onChange, label = '공개 설정', description }: PrivacySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="privacy">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="공개 설정을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">공개</div>
                <div className="text-sm text-muted-foreground">모든 사용자가 볼 수 있습니다</div>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="unlisted">
            <div className="flex items-center space-x-2">
              <EyeOff className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="font-medium">비공개 (링크 공유)</div>
                <div className="text-sm text-muted-foreground">링크를 아는 사람만 볼 수 있습니다</div>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="private">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-red-600" />
              <div>
                <div className="font-medium">비공개</div>
                <div className="text-sm text-muted-foreground">나만 볼 수 있습니다</div>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
