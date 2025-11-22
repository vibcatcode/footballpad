# GitHub Personal Access Token 설정 가이드

## 1. GitHub에서 Personal Access Token 생성

1. **GitHub 로그인** → 우측 상단 프로필 클릭 → **Settings**

2. 좌측 메뉴에서 **Developer settings** 클릭

3. **Personal access tokens** → **Tokens (classic)** 클릭

4. **Generate new token** → **Generate new token (classic)** 클릭

5. 토큰 설정:
   - **Note**: `FootballPad Deployment` (원하는 이름)
   - **Expiration**: 원하는 만료 기간 선택 (90 days, 1 year 등)
   - **Select scopes** (권한 선택):
     - ✅ `repo` (전체 체크) - 저장소 접근 권한
       - ✅ `repo:status`
       - ✅ `repo_deployment`
       - ✅ `public_repo`
       - ✅ `repo:invite`
       - ✅ `security_events`

6. **Generate token** 클릭

7. **⚠️ 중요**: 생성된 토큰을 복사해두세요! (한 번만 표시됩니다)
   - 형식: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 2. Git에 토큰 설정

### 방법 1: Git Credential Helper 사용 (권장)

```bash
# macOS의 경우
git config --global credential.helper osxkeychain

# 토큰을 사용하여 푸시 (첫 푸시 시 토큰 입력)
git push origin main
# Username: your-github-username
# Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (토큰 값)
```

### 방법 2: 원격 저장소 URL에 토큰 포함

```bash
# 현재 원격 저장소 URL 확인
git remote -v

# HTTPS URL로 변경 (토큰 포함)
git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/REPO.git

# 또는 사용자명과 토큰 분리
git remote set-url origin https://USERNAME:YOUR_TOKEN@github.com/USERNAME/REPO.git
```

### 방법 3: 환경 변수 사용

```bash
# .zshrc 또는 .bash_profile에 추가
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Git 설정
git config --global credential.helper store
```

## 3. 테스트

```bash
# 원격 저장소 연결 테스트
git ls-remote origin

# 푸시 테스트
git push origin main
```

## 보안 주의사항

- ⚠️ 토큰을 절대 공개 저장소에 커밋하지 마세요
- ⚠️ `.env` 파일이나 설정 파일에 토큰을 저장하지 마세요
- ⚠️ 토큰이 유출되면 즉시 GitHub에서 토큰을 삭제하세요
- ✅ `osxkeychain`을 사용하면 macOS 키체인에 안전하게 저장됩니다

