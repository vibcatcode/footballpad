'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Trophy, 
  ArrowLeft, 
  Calendar as CalendarIcon,
  Users,
  Settings,
  Save
} from 'lucide-react';
import { PrivacySelect } from '@/components/ui/privacy-select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function CreateLeaguePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    season: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    gameCycle: 'weekly',
    maxGames: 20,
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    venue: '',
    timeSlot: '19:00',
    visibility: 'public' as 'public' | 'private' | 'unlisted'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leagues')
        .insert({
          name: formData.name,
          description: formData.description,
          season: formData.season,
          start_date: formData.startDate?.toISOString().split('T')[0],
          end_date: formData.endDate?.toISOString().split('T')[0],
          max_teams: formData.maxGames,
          created_by: user.id,
          is_public: formData.visibility === 'public',
          visibility: formData.visibility,
        });

      if (error) {
        console.error('Error creating league:', error);
        alert('리그 생성 중 오류가 발생했습니다.');
        return;
      }

      // 리그 설정도 생성
      if (data) {
        await supabase
          .from('league_settings')
          .insert({
            league_id: data[0].id,
            points_for_win: formData.winPoints,
            points_for_draw: formData.drawPoints,
            points_for_loss: formData.lossPoints,
          });
      }

      alert('리그가 성공적으로 생성되었습니다!');
      router.push('/leagues');
    } catch (error) {
      console.error('Error creating league:', error);
      alert('리그 생성 중 오류가 발생했습니다.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-4xl font-bold mb-2">리그 생성</h1>
            <p className="text-muted-foreground">
              새로운 축구 리그를 만들어보세요
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 기본 정보 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    기본 정보
                  </CardTitle>
                  <CardDescription>
                    리그의 기본 정보를 입력하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">리그명 *</Label>
                    <Input
                      id="name"
                      placeholder="예: 호산나 프리미어리그 2025"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">리그 설명</Label>
                    <Textarea
                      id="description"
                      placeholder="리그에 대한 간단한 설명을 입력하세요"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">시즌명</Label>
                    <Input
                      id="season"
                      placeholder="예: 2025 시즌"
                      value={formData.season}
                      onChange={(e) => handleInputChange('season', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>시작일 *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? format(formData.startDate, 'PPP', { locale: ko }) : '날짜 선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => handleInputChange('startDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>종료일 *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, 'PPP', { locale: ko }) : '날짜 선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => handleInputChange('endDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 경기 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    경기 설정
                  </CardTitle>
                  <CardDescription>
                    경기 주기와 규칙을 설정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gameCycle">경기 주기</Label>
                    <Select value={formData.gameCycle} onValueChange={(value) => handleInputChange('gameCycle', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">주간</SelectItem>
                        <SelectItem value="biweekly">격주</SelectItem>
                        <SelectItem value="monthly">월간</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxGames">최대 경기 수</Label>
                    <Input
                      id="maxGames"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxGames}
                      onChange={(e) => handleInputChange('maxGames', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>승점 규칙</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="winPoints" className="text-xs">승리</Label>
                        <Input
                          id="winPoints"
                          type="number"
                          min="0"
                          value={formData.winPoints}
                          onChange={(e) => handleInputChange('winPoints', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="drawPoints" className="text-xs">무승부</Label>
                        <Input
                          id="drawPoints"
                          type="number"
                          min="0"
                          value={formData.drawPoints}
                          onChange={(e) => handleInputChange('drawPoints', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lossPoints" className="text-xs">패배</Label>
                        <Input
                          id="lossPoints"
                          type="number"
                          min="0"
                          value={formData.lossPoints}
                          onChange={(e) => handleInputChange('lossPoints', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">기본 경기장</Label>
                    <Input
                      id="venue"
                      placeholder="예: 호산나축구장"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">기본 경기 시간</Label>
                    <Input
                      id="timeSlot"
                      type="time"
                      value={formData.timeSlot}
                      onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 공개 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    공개 설정
                  </CardTitle>
                  <CardDescription>
                    리그의 공개 범위를 설정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PrivacySelect
                    value={formData.visibility}
                    onChange={(value) => handleInputChange('visibility', value)}
                    label="리그 공개 설정"
                    description="공개 리그는 모든 사용자가 볼 수 있고, 비공개 리그는 링크를 아는 사람만 볼 수 있습니다."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-8">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                리그 생성
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
