'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Upload,
  MapPin,
  Calendar,
  Trophy
} from 'lucide-react';
import { PrivacySelect } from '@/components/ui/privacy-select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function CreateTeamPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    foundedYear: '',
    location: '',
    website: '',
    primaryColor: '#1E40AF',
    secondaryColor: '#F3F4F6',
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
        .from('teams')
        .insert({
          name: formData.name,
          short_name: formData.shortName,
          description: formData.description,
          founded_year: formData.foundedYear ? parseInt(formData.foundedYear) : null,
          location: formData.location,
          website_url: formData.website,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          created_by: user.id,
          is_public: formData.visibility === 'public',
          visibility: formData.visibility,
        });

      if (error) {
        console.error('Error creating team:', error);
        alert('팀 생성 중 오류가 발생했습니다.');
        return;
      }

      alert('팀이 성공적으로 생성되었습니다!');
      window.location.href = '/teams';
    } catch (error) {
      console.error('Error creating team:', error);
      alert('팀 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">팀 생성</h1>
          <p className="text-gray-600 dark:text-gray-300">새로운 팀을 등록하고 관리하세요</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 팀 정보 입력 폼 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>팀 기본 정보</CardTitle>
                  <CardDescription>팀의 기본 정보를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">팀명 *</Label>
                    <Input 
                      id="teamName" 
                      placeholder="팀명을 입력하세요" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortName">팀 약칭</Label>
                    <Input 
                      id="shortName" 
                      placeholder="예: FC서울" 
                      value={formData.shortName}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">팀 소개</Label>
                  <Textarea 
                    id="description" 
                    placeholder="팀에 대한 간단한 소개를 작성해주세요"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">연고지</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="location" 
                        placeholder="예: 서울특별시" 
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded">창단년도</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="founded" 
                        placeholder="예: 1983" 
                        className="pl-10"
                        value={formData.foundedYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">웹사이트</Label>
                  <Input 
                    id="website" 
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>

                {/* 공개 설정 */}
                <div className="space-y-2">
                  <PrivacySelect
                    value={formData.visibility}
                    onChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                    label="팀 공개 설정"
                    description="공개 팀은 모든 사용자가 볼 수 있고, 비공개 팀은 링크를 아는 사람만 볼 수 있습니다."
                  />
                </div>

                <div className="space-y-2">
                  <Label>팀 로고</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">클릭하거나 파일을 드래그하여 업로드</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 2MB)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 팀 구성원 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>팀 구성원</CardTitle>
                <CardDescription>팀의 선수와 스태프를 추가하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">선수 추가</p>
                        <p className="text-sm text-muted-foreground">팀의 선수들을 등록하세요</p>
                      </div>
                    </div>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      선수 추가
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">스태프 추가</p>
                        <p className="text-sm text-muted-foreground">코치, 매니저 등을 등록하세요</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      스태프 추가
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 및 액션 */}
          <div className="space-y-6">
            {/* 팀 미리보기 */}
            <Card>
              <CardHeader>
                <CardTitle>팀 미리보기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">팀명</h3>
                    <p className="text-sm text-muted-foreground">연고지</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>창단: 2024</p>
                    <p>선수: 0명</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    팀 생성하기
                  </Button>
                  <Button type="button" variant="outline" className="w-full">
                    미리보기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 도움말 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">도움말</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 팀명은 고유해야 합니다</p>
                <p>• 로고는 정사각형 비율을 권장합니다</p>
                <p>• 팀 생성 후 선수와 스태프를 추가할 수 있습니다</p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
