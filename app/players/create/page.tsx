'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Plus, 
  Upload,
  Calendar,
  MapPin,
  Trophy,
  Target
} from 'lucide-react';

export default function CreatePlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">선수 등록</h1>
          <p className="text-gray-600 dark:text-gray-300">새로운 선수를 등록하고 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 선수 정보 입력 폼 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>선수 기본 정보</CardTitle>
                <CardDescription>선수의 기본 정보를 입력해주세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerName">선수명 *</Label>
                    <Input id="playerName" placeholder="선수명을 입력하세요" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jerseyNumber">등번호</Label>
                    <Input id="jerseyNumber" placeholder="예: 10" type="number" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">포지션 *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="포지션을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gk">골키퍼</SelectItem>
                        <SelectItem value="cb">센터백</SelectItem>
                        <SelectItem value="lb">레프트백</SelectItem>
                        <SelectItem value="rb">라이트백</SelectItem>
                        <SelectItem value="cdm">수비형 미드필더</SelectItem>
                        <SelectItem value="cm">중앙 미드필더</SelectItem>
                        <SelectItem value="cam">공격형 미드필더</SelectItem>
                        <SelectItem value="lw">레프트 윙</SelectItem>
                        <SelectItem value="rw">라이트 윙</SelectItem>
                        <SelectItem value="st">스트라이커</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team">소속 팀 *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="팀을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fc-seoul">FC 서울</SelectItem>
                        <SelectItem value="suwon-samsung">수원 삼성</SelectItem>
                        <SelectItem value="jeonbuk-hyundai">전북 현대</SelectItem>
                        <SelectItem value="ulsan-hyundai">울산 현대</SelectItem>
                        <SelectItem value="pohang-steelers">포항 스틸러스</SelectItem>
                        <SelectItem value="incheon-united">인천 유나이티드</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">생년월일</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="birthDate" type="date" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">키 (cm)</Label>
                    <Input id="height" placeholder="예: 180" type="number" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">몸무게 (kg)</Label>
                    <Input id="weight" placeholder="예: 75" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">국적</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="nationality" placeholder="예: 대한민국" className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">선수 소개</Label>
                  <Textarea 
                    id="description" 
                    placeholder="선수에 대한 간단한 소개를 작성해주세요"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>선수 사진</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">클릭하거나 파일을 드래그하여 업로드</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 2MB)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 선수 통계 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>선수 통계</CardTitle>
                <CardDescription>선수의 경기 통계를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goals">골</Label>
                    <Input id="goals" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assists">어시스트</Label>
                    <Input id="assists" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matches">경기 수</Label>
                    <Input id="matches" placeholder="0" type="number" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 및 액션 */}
          <div className="space-y-6">
            {/* 선수 미리보기 */}
            <Card>
              <CardHeader>
                <CardTitle>선수 미리보기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">선수명</h3>
                    <p className="text-sm text-muted-foreground">포지션</p>
                    <p className="text-sm text-muted-foreground">소속팀</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>등번호: -</p>
                    <p>골: 0</p>
                    <p>어시스트: 0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    선수 등록하기
                  </Button>
                  <Button variant="outline" className="w-full">
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
                <p>• 선수명과 포지션은 필수 입력 항목입니다</p>
                <p>• 등번호는 팀 내에서 중복될 수 없습니다</p>
                <p>• 통계는 나중에 수정할 수 있습니다</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
